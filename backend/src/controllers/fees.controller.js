const Fees = require("../models/fees.model");
const Student = require("../models/student.model");
const Course = require("../models/course.model");
const Batch = require("../models/batch.model");

const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
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

    return {
        remainingAmount: remaining,
        status,
    };
};

// ✅ Get all fees
exports.allFees = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { paymentMode: { $regex: search, $options: "i" } },
                    { paymentType: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: false, ...searchQuery };
        const totalFees = await Fees.countDocuments(filter);
        const fees = await Fees.find(filter)
            .populate("student", "name email phone status")
            .populate("course", "title category price duration level")
            .populate("batch", "name startDate status")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            fees,
            totalFees,
            page,
            limit,
            totalPages: Math.ceil(totalFees / limit),
        });
    } catch (error) {
        console.error("allFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Get deleted fees
exports.getDeletedFees = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { paymentMode: { $regex: search, $options: "i" } },
                    { paymentType: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: true, ...searchQuery };
        const totalFees = await Fees.countDocuments(filter);
        const fees = await Fees.find(filter)
            .populate("student", "name email phone status")
            .populate("course", "title category price duration level")
            .populate("batch", "name startDate status")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            fees,
            totalFees,
            page,
            limit,
            totalPages: Math.ceil(totalFees / limit),
        });
    } catch (error) {
        console.error("getDeletedFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Get by id
exports.getFeesById = async (req, res) => {
    try {
        const fees = await Fees.findOne({ _id: req.params.id, isDeleted: false })
            .populate("student", "name email phone status")
            .populate("course", "title category price duration level")
            .populate("batch", "name startDate status");

        if (!fees) return res.status(404).json({ message: "Fees record not found" });

        return res.status(200).json(fees);
    } catch (error) {
        console.error("getFeesById error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Add fees
exports.addFees = async (req, res) => {
    try {
        const {
            student,
            course,
            batch,
            paymentType,
            paymentMode,
            amountPaid,
            dueDate,
            note,
        } = req.body;

        if (!student || !course) {
            return res.status(400).json({ message: "Student and Course are required" });
        }

        const studentExists = await Student.findOne({ _id: student, isDeleted: false });
        if (!studentExists) return res.status(404).json({ message: "Student not found" });

        const courseExists = await Course.findOne({ _id: course, isDeleted: false });
        if (!courseExists) return res.status(404).json({ message: "Course not found" });

        if (!courseExists.price || courseExists.price <= 0) {
            return res.status(400).json({ message: "Course price is missing. Set course price first." });
        }

        let batchDoc = null;
        if (batch) {
            batchDoc = await Batch.findOne({ _id: batch, isDeleted: false });
            if (!batchDoc) return res.status(404).json({ message: "Batch not found" });
        }

        const coursePrice = Number(courseExists.price);

        const paid =
            paymentType === "full" ? coursePrice : Number(amountPaid || 0);

        const { remainingAmount, status } = calculateFees({
            coursePrice,
            amountPaid: paid,
        });

        const fees = await Fees.create({
            student,
            course,
            batch: batchDoc?._id || null,
            coursePrice,
            paymentType: paymentType || "full",
            paymentMode: paymentMode || "offline",
            amountPaid: paid,
            remainingAmount,
            status,
            dueDate: dueDate || null,
            note,
        });

        const populated = await Fees.findById(fees._id)
            .populate("student", "name email phone status")
            .populate("course", "title category price duration level")
            .populate("batch", "name startDate status");

        return res.status(201).json({
            message: "Fees record created successfully",
            fees: populated,
        });
    } catch (error) {
        console.error("addFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateFees = async (req, res) => {
    try {
        const { id } = req.params;

        const fees = await Fees.findOne({ _id: id, isDeleted: false });
        if (!fees) return res.status(404).json({ message: "Fees record not found" });

        const {
            student,
            course,
            batch,
            paymentType,
            paymentMode,
            amountPaid,
            dueDate,
            note,
            isActive,
        } = req.body;

        if (student) fees.student = student;
        if (course) fees.course = course;
        if (batch !== undefined) fees.batch = batch || null;

        if (paymentType) fees.paymentType = paymentType;
        if (paymentMode) fees.paymentMode = paymentMode;
        if (dueDate !== undefined) fees.dueDate = dueDate || null;
        if (note !== undefined) fees.note = note;
        if (isActive !== undefined) fees.isActive = isActive;

        const courseDoc = await Course.findById(fees.course);
        if (!courseDoc || courseDoc.isDeleted) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (!courseDoc.price || courseDoc.price <= 0) {
            return res.status(400).json({ message: "Course price is missing. Set course price first." });
        }

        fees.coursePrice = Number(courseDoc.price);

        if (fees.paymentType === "full") {
            fees.amountPaid = fees.coursePrice;
        } else {
            if (amountPaid !== undefined) {
                fees.amountPaid = Number(amountPaid || 0);
            }
        }

        const { remainingAmount, status } = calculateFees({
            coursePrice: fees.coursePrice,
            amountPaid: fees.amountPaid,
        });

        fees.remainingAmount = remainingAmount;
        fees.status = status;

        await fees.save();

        const populated = await Fees.findById(fees._id)
            .populate("student", "name email phone status")
            .populate("course", "title category price duration level")
            .populate("batch", "name startDate status");

        return res.status(200).json({
            message: "Fees updated successfully",
            fees: populated,
        });
    } catch (error) {
        console.error("updateFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.toggleFeesStatus = async (req, res) => {
    try {
        const fees = await Fees.findOne({ _id: req.params.id, isDeleted: false });
        if (!fees) return res.status(404).json({ message: "Fees record not found" });

        fees.isActive = !fees.isActive;
        await fees.save();

        return res.status(200).json({
            message: "Fees status updated",
            isActive: fees.isActive,
        });
    } catch (error) {
        console.error("toggleFeesStatus error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.softDeleteFees = async (req, res) => {
    try {
        const fees = await Fees.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!fees) return res.status(404).json({ message: "Fees record not found" });

        return res.status(200).json({ message: "Fees moved to trash", fees });
    } catch (error) {
        console.error("softDeleteFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.restoreFees = async (req, res) => {
    try {
        const fees = await Fees.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!fees) return res.status(404).json({ message: "Fees record not found" });

        return res.status(200).json({ message: "Fees restored successfully", fees });
    } catch (error) {
        console.error("restoreFees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
