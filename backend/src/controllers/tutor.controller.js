const mongoose = require("mongoose");

const Tutor = require("../models/tutor.model");
const Employee = require("../models/employee.model");
const User = require("../models/authUsers.model");
const Batch = require("../models/batch.model");
const BatchStudentMap = require("../models/batchStudentMap.model");
const Timetable = require("../models/timetable.model");

const nodemailer = require("nodemailer");


const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy || "createdAt").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const search = (req.query.search || "").trim();

    return { page, limit, skip, sortBy, sortOrder, search };
};

const allowedTutorSortFields = [
    "createdAt",
    "expertise",
    "experience",
    "qualification",
    "isActive",
];

const allowedEmployeeSortFields = ["name", "email", "phone", "salary"];

const getSafeSortField = (sortBy) => {
    const sortMap = {
        name: "employee.name",
        email: "employee.email",
        phone: "employee.phone",
        salary: "employee.salary",
    };

    if (allowedTutorSortFields.includes(sortBy)) return sortBy;
    if (sortMap[sortBy]) return sortMap[sortBy];

    return "createdAt";
};


const buildTutorListPipeline = ({
    isDeleted,
    search,
    sortBy,
    sortOrder,
    skip,
    limit,
}) => {
    const safeSortBy = getSafeSortField(sortBy);

    const pipeline = [
        { $match: { isDeleted } },

        {
            $lookup: {
                from: "employees",
                localField: "employee",
                foreignField: "_id",
                as: "employee",
            },
        },

        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

        ...(search
            ? [
                {
                    $match: {
                        $or: [
                            { expertise: { $regex: search, $options: "i" } },
                            { qualification: { $regex: search, $options: "i" } },
                            { bio: { $regex: search, $options: "i" } },

                            { "employee.name": { $regex: search, $options: "i" } },
                            { "employee.email": { $regex: search, $options: "i" } },
                            { "employee.phone": { $regex: search, $options: "i" } },
                            { "employee.department": { $regex: search, $options: "i" } },
                        ],
                    },
                },
            ]
            : []),

        {
            $addFields: {
                "employee.name": { $ifNull: ["$employee.name", "—"] },
                "employee.email": { $ifNull: ["$employee.email", "—"] },
                "employee.phone": { $ifNull: ["$employee.phone", "—"] },
                "employee.salary": { $ifNull: ["$employee.salary", 0] },
            },
        },

        { $sort: { [safeSortBy]: sortOrder } },

        {
            $facet: {
                tutors: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];

    return pipeline;
};

const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
    let pass = "";
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSKEY,
    },
});

const sendTutorLoginMail = async ({ toEmail, name, password }) => {
    if (!toEmail) return;

    const mailOptions = {
        from: process.env.EMAILID,
        to: toEmail,
        subject: "Your Tutor Account Created - LMS Login Details",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to LMS</h2>
        <p>Hello <b>${name || "Tutor"}</b>,</p>

        <p>Your Tutor account has been created successfully.</p>

        <h3>Login Details</h3>
        <p><b>Email:</b> ${toEmail}</p>
        <p><b>Password:</b> ${password}</p>
        <p><b>Role:</b> Tutor</p>

        <p style="margin-top:15px;">
          Please login and change your password after first login.
        </p>

        <p style="color: #666; font-size: 12px;">
          If you did not request this, please contact the institute admin.
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};



exports.allTutors = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const pipeline = buildTutorListPipeline({
            isDeleted: false,
            search,
            sortBy,
            sortOrder,
            skip,
            limit,
        });

        const result = await Tutor.aggregate(pipeline);

        const tutors = result?.[0]?.tutors || [];
        const totalTutors = result?.[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            tutors,
            totalTutors,
            page,
            limit,
            totalPages: Math.ceil(totalTutors / limit),
        });
    } catch (error) {
        console.error("Get tutors error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedTutors = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const pipeline = buildTutorListPipeline({
            isDeleted: true,
            search,
            sortBy,
            sortOrder,
            skip,
            limit,
        });

        const result = await Tutor.aggregate(pipeline);

        const tutors = result?.[0]?.tutors || [];
        const totalTutors = result?.[0]?.totalCount?.[0]?.count || 0;

        return res.status(200).json({
            tutors,
            totalTutors,
            page,
            limit,
            totalPages: Math.ceil(totalTutors / limit),
        });
    } catch (error) {
        console.error("Get deleted tutors error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTutorById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid tutor id" });
        }

        const tutor = await Tutor.findOne({
            _id: id,
            isDeleted: false,
        }).populate(
            "employee",
            "name email phone department designation salary joiningDate isActive"
        );

        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        return res.status(200).json(tutor);
    } catch (error) {
        console.error("Get tutor by id error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.addTutor = async (req, res) => {
    try {
        const { employee, expertise, experience, qualification, bio } = req.body;

        if (!employee || !mongoose.Types.ObjectId.isValid(employee)) {
            return res.status(400).json({
                message: "Valid employee id is required",
            });
        }

        if (!expertise) {
            return res.status(400).json({
                message: "Expertise is required",
            });
        }

        const employeeDoc = await Employee.findOne({
            _id: employee,
            isDeleted: false,
        });

        if (!employeeDoc) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const existsTutor = await Tutor.findOne({
            employee,
            isDeleted: false,
        });

        if (existsTutor) {
            return res.status(400).json({
                message: "Tutor profile already exists for this employee",
            });
        }

        const tutor = await Tutor.create({
            employee,
            expertise,
            experience: Number(experience || 0),
            qualification: qualification || "",
            bio: bio || "",
            isActive: true,
            isDeleted: false,
            deletedAt: null,
        });

        await Employee.updateOne(
            { _id: employeeDoc._id },
            { $set: { designation: "teacher" } }
        );


        let loginCreated = false;
        let generatedPassword = null;

        if (employeeDoc.email) {
            const normalizedEmail = employeeDoc.email.toLowerCase().trim();

            const existingUser = await User.findOne({
                email: normalizedEmail,
                isDeleted: false,
            }).select("+password");

            if (!existingUser) {
                generatedPassword = generatePassword(10);

                await User.create({
                    email: normalizedEmail,
                    password: generatedPassword,
                    role: "tutor",
                    tutor: tutor._id,
                    employee: employeeDoc._id,
                });

                loginCreated = true;

                try {
                    await sendTutorLoginMail({
                        toEmail: normalizedEmail,
                        name: employeeDoc.name,
                        password: generatedPassword,
                    });
                } catch (mailErr) {
                    console.error("Tutor mail sending failed:", mailErr);
                }
            } else {
                await User.updateOne(
                    { _id: existingUser._id },
                    {
                        $set: {
                            role: "tutor",
                            tutor: tutor._id,
                            employee: employeeDoc._id,
                            isActive: true,
                            isDeleted: false,
                            deletedAt: null,
                        },
                    }
                );
            }
        }

        const populated = await Tutor.findById(tutor._id).populate(
            "employee",
            "name email phone department designation salary joiningDate isActive"
        );

        return res.status(201).json({
            message:
                "Tutor added successfully" +
                (loginCreated ? " + login created + mail sent" : " + login updated"),
            tutor: populated,
            loginCreated,
        });
    } catch (error) {
        console.error("Add tutor error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateTutor = async (req, res) => {
    try {
        const { id } = req.params;
        const { employee, expertise, experience, qualification, bio } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid tutor id" });
        }

        const tutor = await Tutor.findOne({ _id: id, isDeleted: false });
        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        if (employee) {
            if (!mongoose.Types.ObjectId.isValid(employee)) {
                return res.status(400).json({ message: "Invalid employee id" });
            }

            const employeeDoc = await Employee.findOne({
                _id: employee,
                isDeleted: false,
            });

            if (!employeeDoc) {
                return res.status(404).json({ message: "Employee not found" });
            }

            const already = await Tutor.findOne({
                employee,
                _id: { $ne: id },
                isDeleted: false,
            });

            if (already) {
                return res.status(400).json({
                    message: "Another tutor already uses this employee",
                });
            }

            tutor.employee = employeeDoc._id;

            await Employee.updateOne(
                { _id: employeeDoc._id },
                { $set: { designation: "teacher" } }
            );

            await User.updateOne(
                { tutor: tutor._id, role: "tutor", isDeleted: false },
                { $set: { employee: employeeDoc._id } }
            );
        }

        if (expertise !== undefined) tutor.expertise = expertise;
        if (experience !== undefined) tutor.experience = Number(experience || 0);
        if (qualification !== undefined) tutor.qualification = qualification;
        if (bio !== undefined) tutor.bio = bio;

        await tutor.save();

        const populated = await Tutor.findById(tutor._id).populate(
            "employee",
            "name email phone department designation salary joiningDate isActive"
        );

        return res.status(200).json({
            message: "Tutor updated successfully",
            tutor: populated,
        });
    } catch (error) {
        console.error("Update tutor error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleTutorStatus = async (req, res) => {
    try {
        const tutor = await Tutor.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        tutor.isActive = !tutor.isActive;
        await tutor.save();

        await User.updateOne(
            { tutor: tutor._id, role: "tutor", isDeleted: false },
            { $set: { isActive: tutor.isActive } }
        );

        return res.status(200).json({
            message: "Tutor status updated",
            isActive: tutor.isActive,
        });
    } catch (error) {
        console.error("Toggle tutor status error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        await User.updateOne(
            { tutor: tutor._id, role: "tutor" },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        return res.status(200).json({ message: "Tutor moved to trash", tutor });
    } catch (error) {
        console.error("Soft delete tutor error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.id,
            { isDeleted: false, deletedAt: null },
            { new: true }
        );

        if (!tutor) return res.status(404).json({ message: "Tutor not found" });

        await User.updateOne(
            { tutor: tutor._id, role: "tutor" },
            { $set: { isDeleted: false, deletedAt: null } }
        );

        return res.status(200).json({
            message: "Tutor restored successfully",
            tutor,
        });
    } catch (error) {
        console.error("Restore tutor error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMeTutorDashboard = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.user?._id,
            role: "tutor",
            isDeleted: false,
        }).lean();

        if (!user?.tutor) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }

        const tutor = await Tutor.findOne({
            _id: user.tutor,
            isDeleted: false,
        })
            .populate("employee", "name email phone department designation")
            .lean();

        if (!tutor) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }

        const batches = await Batch.find({
            tutor: tutor._id,
            isDeleted: false,
        })
            .populate("course", "title category level")
            .sort({ startDate: 1 })
            .lean();

        const batchIds = batches.map((b) => b._id);

        const mappings = await BatchStudentMap.find({
            batch: { $in: batchIds },
            status: "active",
            isDeleted: false,
        })
            .populate("batch", "name status startDate endDate")
            .populate({
                path: "student",
                select: "status",
                populate: {
                    path: "visitor",
                    select: "name email phone",
                },
            })
            .lean();

        const timetable = await Timetable.find({
            batch: { $in: batchIds },
            isDeleted: false,
        })
            .populate("batch", "name")
            .populate("course", "title")
            .sort({ day: 1, startMinutes: 1 })
            .lean();

        return res.status(200).json({
            tutor,
            batches,
            mappings,
            timetable,
            summary: {
                totalBatches: batches.length,
                totalStudents: mappings.length,
                totalSlots: timetable.length,
            },
        });
    } catch (error) {
        console.error("getMeTutorDashboard error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMeStudents = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const { batch, status } = req.query;

        const user = await User.findOne({
            _id: req.user?._id,
            role: "tutor",
            isDeleted: false,
        }).lean();

        if (!user?.tutor) {
            return res.status(404).json({ message: "Tutor profile not found" });
        }

        const mapFilter = {
            tutor: user.tutor,
            status: "active",
            isDeleted: false,
            ...(batch ? { batch } : {}),
        };

        const mappings = await BatchStudentMap.find(mapFilter)
            .populate("batch", "name status startDate endDate")
            .populate("course", "title category level")
            .populate({
                path: "student",
                match: {
                    isDeleted: false,
                    ...(status ? { status } : {}),
                },
                select: "status enrollmentDate",
                populate: {
                    path: "visitor",
                    select: "name email phone",
                },
            })
            .lean();

        let students = mappings
            .filter((m) => m.student && m.student.visitor)
            .map((m) => ({
                _id: m.student._id,
                name: m.student.visitor.name,
                email: m.student.visitor.email,
                phone: m.student.visitor.phone,
                status: m.student.status,
                batch: m.batch,
                course: m.course,
                enrollmentDate: m.student.enrollmentDate,
            }));

        if (search) {
            const q = search.toLowerCase();
            students = students.filter((s) => {
                return (
                    String(s.name || "").toLowerCase().includes(q) ||
                    String(s.email || "").toLowerCase().includes(q) ||
                    String(s.phone || "").toLowerCase().includes(q)
                );
            });
        }

        const sortField = ["name", "email", "status", "enrollmentDate", "createdAt"].includes(sortBy)
            ? sortBy
            : "createdAt";

        students.sort((a, b) => {
            const av = a[sortField] || "";
            const bv = b[sortField] || "";
            if (sortField === "enrollmentDate" || sortField === "createdAt") {
                return (new Date(av) - new Date(bv)) * sortOrder;
            }
            return String(av).localeCompare(String(bv)) * sortOrder;
        });

        const totalStudents = students.length;
        const paginated = students.slice(skip, skip + limit);

        return res.status(200).json({
            students: paginated,
            totalStudents,
            page,
            limit,
            totalPages: Math.ceil(totalStudents / limit),
        });
    } catch (error) {
        console.error("getMeStudents error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
