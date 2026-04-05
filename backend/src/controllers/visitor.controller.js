const Visitor = require("../models/visitor.model");
const Student = require("../models/student.model");
const Employee = require("../models/employee.model");
const User = require("../models/authUsers.model");
const Course = require("../models/course.model");
const Fees = require("../models/fees.model");
const Batch = require("../models/batch.model");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseListParams = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || "10", 10), 1),
    100,
  );
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy || "createdAt").trim();
  const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
  const search = (req.query.search || "").trim();
  return { page, limit, skip, sortBy, sortOrder, search };
};

const calculateFees = ({ coursePrice, amountPaid }) => {
  const paid = Number(amountPaid || 0);
  const price = Number(coursePrice || 0);
  const remaining = Math.max(price - paid, 0);
  let status = "unpaid";
  if (paid === 0) status = "unpaid";
  else if (paid >= price) status = "paid";
  else status = "partial";
  return { remainingAmount: remaining, status };
};

const getDateRangeFilter = ({ created, from, to }) => {
  if (!created) return null;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfTomorrow = new Date(startOfToday.getTime() + 86400000);

  if (created === "today") return { $gte: startOfToday, $lt: startOfTomorrow };
  if (created === "yesterday") {
    const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
    return { $gte: startOfYesterday, $lt: startOfToday };
  }
  if (created === "last7days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return { $gte: d, $lte: now };
  }
  if (created === "last30days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { $gte: d, $lte: now };
  }
  if (created === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { $gte: start, $lte: now };
  }
  if (created === "custom") {
    const range = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) range.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        toDate.setHours(23, 59, 59, 999); // include entire "to" day
        range.$lte = toDate;
      }
    }
    return Object.keys(range).length > 0 ? range : null;
  }
  return null;
};

const buildVisitorFilter = (req, tabType) => {
  const { search } = parseListParams(req);
  const { status, source, course, created, from, to } = req.query;

  const filter = {};

  filter.isDeleted = tabType === "trash";

  if (tabType === "active") filter.status = { $ne: "converted" };
  if (tabType === "not-interested") filter.status = "not-interested";
  if (tabType === "follow-up") {
    filter.status = "follow-up";
    filter.followUpDate = { $lte: new Date() };
  }
  if (tabType === "converted") filter.status = "converted";

  if (status) filter.status = status;
  if (source) filter.source = source;

  if (course) {
    if (mongoose.Types.ObjectId.isValid(course)) {
      filter.course = new mongoose.Types.ObjectId(course);
    }
  }

  const createdRange = getDateRangeFilter({ created, from, to });
  if (createdRange) filter.createdAt = createdRange;
  if (search) {
    const stringConditions = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { source: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { conversionType: { $regex: search, $options: "i" } },
      { note: { $regex: search, $options: "i" } },
      { notInterestedReason: { $regex: search, $options: "i" } },
    ];

    const digitsOnly = search.replace(/\D/g, "");
    if (digitsOnly.length >= 3) {
      stringConditions.push({ phone: Number(digitsOnly) });
    }

    filter.$or = stringConditions;
  }

  return filter;
};

const getSafeSort = (sortBy, sortOrder) => {
  const allowed = [
    "createdAt",
    "updatedAt",
    "name",
    "email",
    "status",
    "source",
    "followUpDate",
  ];
  const finalSortBy = allowed.includes(sortBy) ? sortBy : "createdAt";
  return { [finalSortBy]: sortOrder };
};

const hydrateVisitorCourses = async (visitors) => {
  const courseIds = [
    ...new Set(
      visitors
        .map((visitor) => visitor.course)
        .filter((courseId) => mongoose.Types.ObjectId.isValid(courseId))
        .map((courseId) => String(courseId)),
    ),
  ];

  if (!courseIds.length) return visitors;

  const courses = await Course.find(
    { _id: { $in: courseIds } },
    "title category level price",
  ).lean();

  const courseMap = new Map(
    courses.map((course) => [String(course._id), course]),
  );

  return visitors.map((visitor) => ({
    ...visitor,
    course: courseMap.get(String(visitor.course)) || null,
  }));
};

const listVisitorsByTab = async (req, res, tabType) => {
  try {
    const { page, limit, skip, sortBy, sortOrder } = parseListParams(req);
    const filter = buildVisitorFilter(req, tabType);

    const [totalVisitors, visitors] = await Promise.all([
      Visitor.countDocuments(filter),
      Visitor.find(filter)
        .sort(getSafeSort(sortBy, sortOrder))
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const hydratedVisitors = await hydrateVisitorCourses(visitors);

    return res.status(200).json({
      visitors: hydratedVisitors,
      totalVisitors,
      page,
      limit,
      totalPages: Math.ceil(totalVisitors / limit),
    });
  } catch (error) {
    console.error("listVisitorsByTab error:", error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

const generateRandomPassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
  let pass = "";
  for (let i = 0; i < length; i++)
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
};

const sendStudentWelcomeEmail = async ({
  to,
  name,
  password,
  courseTitle,
  paid,
  remaining,
}) => {
  if (!process.env.EMAILID || !process.env.PASSKEY) {
    console.log("EMAILID/PASSKEY missing in env. Skipping email.");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAILID, pass: process.env.PASSKEY },
  });
  await transporter.sendMail({
    from: `"LMS Support" <${process.env.EMAILID}>`,
    to,
    subject: "Your Student Account has been created",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Welcome to the LMS</h2><p>Hello <b>${name}</b>,</p><p>Your student account has been created.</p><p><b>Email:</b> ${to}<br/><b>Password:</b> ${password}</p><p><b>Course:</b> ${courseTitle}<br/><b>Amount Paid:</b> ₹${paid}<br/><b>Remaining:</b> ₹${remaining}</p><p>Please login and change your password after first login.</p><p>Thanks,<br/>LMS Team</p></div>`,
  });
};

const sendEmployeeWelcomeEmail = async ({
  to,
  name,
  password,
  designation,
  department,
}) => {
  if (!process.env.EMAILID || !process.env.PASSKEY) {
    console.log("EMAILID/PASSKEY missing in env. Skipping email.");
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAILID, pass: process.env.PASSKEY },
  });
  await transporter.sendMail({
    from: `"LMS Support" <${process.env.EMAILID}>`,
    to,
    subject: "Your Employee Account has been created",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Welcome to the Team</h2><p>Hello <b>${name}</b>,</p><p>Your employee account has been created.</p><p><b>Email:</b> ${to}<br/><b>Password:</b> ${password}</p><p><b>Department:</b> ${department}<br/><b>Designation:</b> ${designation}</p><p>Please login and change your password after first login.</p><p>Thanks,<br/>LMS Team</p></div>`,
  });
};

// ─── Controllers ─────────────────────────────────────────────────────────────

exports.createVisitor = async (req, res) => {
  try {
    const { name, email, course } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!course) return res.status(400).json({ message: "Course is required" });
    if (!mongoose.Types.ObjectId.isValid(course))
      return res.status(400).json({ message: "Invalid course ID" });

    const courseDoc = await Course.findOne({ _id: course, isDeleted: false });
    if (!courseDoc)
      return res.status(404).json({ message: "Course not found" });

    if (email) {
      const existing = await Visitor.findOne({ email, isDeleted: false });
      if (existing)
        return res
          .status(400)
          .json({ message: "Visitor with this email already exists" });
    }

    const visitor = await Visitor.create({
      ...req.body,
      status: req.body.status || "new",
      isDeleted: false,
      deletedAt: null,
    });
    const populated = await Visitor.findById(visitor._id).populate(
      "course",
      "title category level price",
    );
    return res.status(201).json(populated);
  } catch (err) {
    console.error("createVisitor error:", err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getVisitors = (req, res) => listVisitorsByTab(req, res, "active");
exports.getDeletedVisitors = (req, res) => listVisitorsByTab(req, res, "trash");
exports.getNotInterestedVisitors = (req, res) =>
  listVisitorsByTab(req, res, "not-interested");
exports.getFollowUpVisitors = (req, res) =>
  listVisitorsByTab(req, res, "follow-up");
exports.getConvertedVisitors = (req, res) =>
  listVisitorsByTab(req, res, "converted");

exports.getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ _id: req.params.id }).populate(
      "course",
      "title category level price",
    );
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    return res.status(200).json(visitor);
  } catch (error) {
    console.error("getVisitorById error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    if (req.body.course) {
      if (!mongoose.Types.ObjectId.isValid(req.body.course))
        return res.status(400).json({ message: "Invalid course ID" });
      const courseDoc = await Course.findOne({
        _id: req.body.course,
        isDeleted: false,
      });
      if (!courseDoc)
        return res.status(404).json({ message: "Course not found" });
    }

    Object.assign(visitor, req.body);
    await visitor.save();

    const populated = await Visitor.findById(visitor._id).populate(
      "course",
      "title category level price",
    );
    return res.status(200).json(populated);
  } catch (error) {
    console.error("updateVisitor error:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.softDeleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    return res.status(200).json({ message: "Visitor moved to trash" });
  } catch (error) {
    console.error("softDeleteVisitor error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.restoreVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true },
    );
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    return res
      .status(200)
      .json({ message: "Visitor restored successfully", visitor });
  } catch (error) {
    console.error("restoreVisitor error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.markNotInterested = async (req, res) => {
  try {
    const { notInterestedReason, followUpDate } = req.body;
    const visitor = await Visitor.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    visitor.status = "not-interested";
    visitor.notInterestedReason = notInterestedReason || "";
    visitor.followUpDate = followUpDate || null;
    await visitor.save();
    return res
      .status(200)
      .json({ message: "Visitor marked as not interested", visitor });
  } catch (error) {
    console.error("markNotInterested error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// CONVERT TO STUDENT
// ─────────────────────────────────────────────
exports.convertToStudent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let studentPassword = "";
  let studentEmail = "";
  let courseTitle = "";
  let paidAmount = 0;
  let remainingAmount = 0;
  try {
    const visitor = await Visitor.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).session(session);
    if (!visitor) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Visitor not found" });
    }
    if (visitor.status === "converted") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Visitor already converted" });
    }
    if (!visitor.email) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Email is required for conversion" });
    }
    if (!visitor.course) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Visitor must have a course assigned" });
    }

    const existingStudent = await Student.findOne({
      visitor: visitor._id,
      isDeleted: false,
    }).session(session);
    if (existingStudent) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Student already exists for this visitor" });
    }

    const existingUser = await User.findOne({
      email: visitor.email,
      isDeleted: false,
    }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "A user account already exists with this email" });
    }

    const courseDoc = await Course.findOne({
      _id: visitor.course,
      isDeleted: false,
    }).session(session);
    if (!courseDoc) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Course not found. Update visitor course first." });
    }
    if (!courseDoc.price || courseDoc.price <= 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({
          message: "Course price is missing. Set the course price first.",
        });
    }

    courseTitle = courseDoc.title;
    studentEmail = visitor.email;

    const {
      adhaar,
      address,
      dateOfBirth,
      gender,
      guardianName,
      guardianPhone,
      status,
      profileImage,
      identityProof,
      documents,
    } = req.body;
    const allowedStatus = ["active", "inactive", "suspended"];
    const studentStatus = allowedStatus.includes(status) ? status : "active";
    const allowedGender = ["male", "female", "other"];
    const studentGender = allowedGender.includes(gender) ? gender : undefined;
    const dobValue = dateOfBirth ? new Date(dateOfBirth) : undefined;
    if (dateOfBirth && isNaN(dobValue?.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid dateOfBirth" });
    }

    const student = await Student.create(
      [
        {
          visitor: visitor._id,
          enrollmentDate: new Date(),
          status: studentStatus,
          adhaar: adhaar || undefined,
          address: address || undefined,
          dateOfBirth: dobValue || undefined,
          gender: studentGender,
          guardianName: guardianName || undefined,
          guardianPhone: guardianPhone || undefined,
          profileImage: profileImage?.url
            ? {
                url: profileImage.url,
                publicId: profileImage.publicId || undefined,
              }
            : undefined,
          identityProof:
            identityProof?.type ||
            identityProof?.number ||
            identityProof?.frontImage?.url ||
            identityProof?.backImage?.url
              ? {
                  type: identityProof?.type || undefined,
                  number: identityProof?.number || undefined,
                  frontImage: identityProof?.frontImage?.url
                    ? {
                        url: identityProof.frontImage.url,
                        publicId:
                          identityProof.frontImage.publicId || undefined,
                      }
                    : undefined,
                  backImage: identityProof?.backImage?.url
                    ? {
                        url: identityProof.backImage.url,
                        publicId: identityProof.backImage.publicId || undefined,
                      }
                    : undefined,
                }
              : undefined,
          documents: Array.isArray(documents) ? documents : [],
          isActive: true,
          isDeleted: false,
        },
      ],
      { session },
    );

    const studentDoc = student[0];
    studentPassword = generateRandomPassword(10);
    const user = await User.create(
      [
        {
          email: visitor.email,
          password: studentPassword,
          role: "student",
          student: studentDoc._id,
        },
      ],
      { session },
    );

    const {
      paymentType = "full",
      paymentMode = "offline",
      amountPaid,
      dueDate,
      note,
      batch,
    } = req.body;
    let batchDoc = null;
    if (batch) {
      batchDoc = await Batch.findOne({ _id: batch, isDeleted: false }).session(
        session,
      );
      if (!batchDoc) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Batch not found" });
      }
    }

    const coursePrice = Number(courseDoc.price);
    if (paymentType === "full") {
      paidAmount = coursePrice;
    } else {
      paidAmount = Number(amountPaid || 0);
      if (!amountPaid || isNaN(paidAmount) || paidAmount < 0) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({
            message: "Valid amountPaid is required for partial payment",
          });
      }
    }

    const { remainingAmount: rem, status: feesStatus } = calculateFees({
      coursePrice,
      amountPaid: paidAmount,
    });
    remainingAmount = rem;

    const dueDateValue = dueDate ? new Date(dueDate) : null;
    if (dueDate && isNaN(dueDateValue?.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid dueDate" });
    }

    const fees = await Fees.create(
      [
        {
          student: studentDoc._id,
          course: courseDoc._id,
          batch: batchDoc?._id || null,
          coursePrice,
          paymentType,
          paymentMode,
          amountPaid: paidAmount,
          remainingAmount,
          status: feesStatus,
          dueDate: dueDateValue,
          note: note || "",
        },
      ],
      { session },
    );

    visitor.status = "converted";
    visitor.conversionType = "student";
    visitor.convertedToId = studentDoc._id;
    await visitor.save({ session });
    await session.commitTransaction();

    sendStudentWelcomeEmail({
      to: studentEmail,
      name: visitor.name,
      password: studentPassword,
      courseTitle,
      paid: paidAmount,
      remaining: remainingAmount,
    }).catch((e) => console.error("Student welcome email failed:", e));

    return res
      .status(201)
      .json({
        message: "Visitor converted to student successfully",
        visitor,
        student: studentDoc,
        user: { email: user[0].email, role: user[0].role },
        fees: fees[0],
      });
  } catch (err) {
    await session.abortTransaction();
    console.error("convertToStudent error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────
// CONVERT TO EMPLOYEE
// ─────────────────────────────────────────────
exports.convertToEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { department, designation, salary } = req.body;

    const visitor = await Visitor.findOne({
      _id: id,
      isDeleted: false,
    }).session(session);
    if (!visitor) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Visitor not found" });
    }
    if (visitor.status === "converted") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Visitor already converted" });
    }
    if (!visitor.email) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Email is required for conversion" });
    }
    if (!department || !designation) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Department and designation are required" });
    }

    const existingUser = await User.findOne({
      email: visitor.email,
      isDeleted: false,
    }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "A user account already exists with this email" });
    }

    const employee = await Employee.create(
      [
        {
          name: visitor.name,
          email: visitor.email,
          phone: visitor.phone || undefined,
          department,
          designation,
          salary: Number(salary || 0),
          isActive: true,
          isDeleted: false,
        },
      ],
      { session },
    );

    const employeeDoc = employee[0];
    const defaultPassword = generateRandomPassword(10);
    const role = designation.toLowerCase().includes("hr") ? "hr" : "admin";

    const user = await User.create(
      [
        {
          email: visitor.email,
          password: defaultPassword,
          role,
          employee: employeeDoc._id,
        },
      ],
      { session },
    );

    visitor.status = "converted";
    visitor.conversionType = "employee";
    visitor.convertedToId = employeeDoc._id;
    await visitor.save({ session });
    await session.commitTransaction();

    sendEmployeeWelcomeEmail({
      to: visitor.email,
      name: visitor.name,
      password: defaultPassword,
      designation,
      department,
    }).catch((e) => console.error("Employee welcome email failed:", e));

    return res
      .status(201)
      .json({
        message: "Visitor converted to employee successfully",
        visitor,
        employee: employeeDoc,
        user: { email: user[0].email, role: user[0].role },
      });
  } catch (err) {
    await session.abortTransaction();
    console.error("convertToEmployee error:", err);
    return res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
