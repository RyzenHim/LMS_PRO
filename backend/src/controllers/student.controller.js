const mongoose = require("mongoose");
const Student = require("../models/student.model");
const Visitor = require("../models/visitor.model");
const User = require("../models/authUsers.model");
const BatchStudentMap = require("../models/batchStudentMap.model");

const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const search = (req.query.search || "").trim();
    return { page, limit, skip, sortBy, sortOrder, search };
};

exports.allStudents = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const visitorSearchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const studentSearchQuery = search
            ? {
                $or: [{ adhaar: { $regex: search, $options: "i" } }],
            }
            : {};

        const studentsFilter = { isDeleted: false, ...studentSearchQuery };

        const students = await Student.find(studentsFilter)
            .populate({
                path: "visitor",
                match: { isDeleted: false, ...visitorSearchQuery },
                select: "name email phone course status createdAt",
                populate: {
                    path: "course",
                    select: "title category price duration level",
                },
            })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        const filteredStudents = students.filter((s) => s.visitor);

        const totalStudents = await Student.countDocuments({ isDeleted: false });

        return res.status(200).json({
            students: filteredStudents,
            totalStudents,
            page,
            limit,
            totalPages: Math.ceil(totalStudents / limit),
        });
    } catch (error) {
        console.error("allStudents error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid student id" });
        }

        const student = await Student.findOne({
            _id: id,
            isDeleted: false,
        })
            .populate({
                path: "visitor",
                select: "name email phone course status",
                populate: {
                    path: "course",
                    select: "title category price duration level",
                },
            })
            .lean();

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const user = await User.findOne({
            role: "student",
            student: student._id,
            isDeleted: false,
        }).select("email role theme isActive lastLogin createdAt");

        return res.status(200).json({ student, user });
    } catch (error) {
        console.error("getStudentById error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            email,
            phone,
            course,
            adhaar,
            enrollmentDate,
            status,
            address,
            dateOfBirth,
            gender,
            guardianName,
            guardianPhone,
            profileImage,
            identityProof,
            documents,
            isActive,
        } = req.body;

        const student = await Student.findOne({ _id: id, isDeleted: false });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const visitor = await Visitor.findOne({
            _id: student.visitor,
            isDeleted: false,
        });

        if (!visitor) {
            return res.status(404).json({ message: "Visitor record not found for this student" });
        }

        if (adhaar !== undefined) student.adhaar = adhaar || null;
        if (enrollmentDate !== undefined) student.enrollmentDate = enrollmentDate || null;
        if (status !== undefined) student.status = status;
        if (address !== undefined) student.address = address;
        if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth || null;
        if (gender !== undefined) student.gender = gender;
        if (guardianName !== undefined) student.guardianName = guardianName;
        if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;

        if (profileImage !== undefined) student.profileImage = profileImage;
        if (identityProof !== undefined) student.identityProof = identityProof;
        if (documents !== undefined) student.documents = documents;

        if (isActive !== undefined) student.isActive = isActive;

        if (name !== undefined) visitor.name = name;
        if (email !== undefined) visitor.email = email;
        if (phone !== undefined) visitor.phone = phone;
        if (course !== undefined) visitor.course = course;

        await student.save();
        await visitor.save();

        const populated = await Student.findById(student._id)
            .populate({
                path: "visitor",
                select: "name email phone course status",
                populate: {
                    path: "course",
                    select: "title category price duration level",
                },
            })
            .lean();

        return res.status(200).json({
            message: "Student updated successfully",
            student: populated,
        });
    } catch (error) {
        console.error("updateStudent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleStudentStatus = async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id, isDeleted: false });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.isActive = !student.isActive;
        await student.save();

        return res.status(200).json({
            message: "Student status updated",
            isActive: student.isActive,
        });
    } catch (error) {
        console.error("toggleStudentStatus error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id, isDeleted: false });
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.isDeleted = true;
        student.deletedAt = new Date();
        await student.save();

        await User.updateOne(
            { student: student._id, role: "student" },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        return res.status(200).json({ message: "Student moved to trash" });
    } catch (error) {
        console.error("softDeleteStudent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreStudent = async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id, isDeleted: true });
        if (!student) return res.status(404).json({ message: "Student not found" });

        student.isDeleted = false;
        student.deletedAt = null;
        await student.save();

        await User.updateOne(
            { student: student._id, role: "student" },
            { $set: { isDeleted: false, deletedAt: null } }
        );

        return res.status(200).json({ message: "Student restored successfully" });
    } catch (error) {
        console.error("restoreStudent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedStudents = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const visitorSearchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const studentSearchQuery = search
            ? {
                $or: [{ adhaar: { $regex: search, $options: "i" } }],
            }
            : {};

        const students = await Student.find({ isDeleted: true, ...studentSearchQuery })
            .populate({
                path: "visitor",
                match: { isDeleted: false, ...visitorSearchQuery },
                select: "name email phone course status createdAt",
                populate: {
                    path: "course",
                    select: "title category price duration level",
                },
            })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        const filtered = students.filter((s) => s.visitor);

        const totalStudents = await Student.countDocuments({ isDeleted: true });

        return res.status(200).json({
            students: filtered,
            totalStudents,
            page,
            limit,
            totalPages: Math.ceil(totalStudents / limit),
        });
    } catch (error) {
        console.error("getDeletedStudents error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMeStudent = async (req, res) => {
    try {
        const userId = req.user?._id;

        const user = await User.findOne({
            _id: userId,
            role: "student",
            isDeleted: false,
        })
            .select("email role theme isActive student")
            .lean();

        if (!user || !user.student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const student = await Student.findOne({
            _id: user.student,
            isDeleted: false,
        })
            .populate({
                path: "visitor",
                select: "name email phone course status",
                populate: {
                    path: "course",
                    select: "title category price duration level",
                },
            })
            .lean();

        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const mappings = await BatchStudentMap.find({
            student: student._id,
            status: "active",
            isDeleted: false,
        })
            .populate("batch", "name startDate endDate status isActive")
            .populate("course", "title category level price")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name",
                },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            user,
            student,
            mappings,
        });
    } catch (error) {
        console.error("getMeStudent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
