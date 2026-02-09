const Student = require('../models/student.model');
const Course = require("../models/course.model");

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

        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { adhaar: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: false, ...searchQuery };
        const totalStudents = await Student.countDocuments(filter);

        const students = await Student.find(filter)
            .populate("course", "title category price level")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            students,
            totalStudents,
            page,
            limit,
            totalPages: Math.ceil(totalStudents / limit),
        });
    } catch (error) {
        console.error("Get students error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            isDeleted: false
        }).populate("course", "title category price level");

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error("Get student by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addStudent = async (req, res) => {
    try {
        const { name, email, phone, course, address, dateOfBirth, guardianName, guardianPhone, status } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({ message: "Name, email, and course are required" });
        }

        const exists = await Student.findOne({ email, isDeleted: false });
        if (exists) {
            return res.status(400).json({ message: "Student already exists" });
        }

        const courseDoc = await Course.findOne({ _id: course, isDeleted: false });
        if (!courseDoc) {
            return res.status(404).json({ message: "Course not found" });
        }

        const student = await Student.create({
            name,
            email,
            phone,
            course: courseDoc._id,
            address,
            dateOfBirth,
            guardianName,
            guardianPhone,
            status: status || "active"
        });

        const populatedStudent = await Student.findById(student._id)
            .populate("course", "title category price level");

        res.status(201).json({
            message: "Student added successfully",
            student: populatedStudent,
        });
    } catch (error) {
        console.error("Add student error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, course, address, dateOfBirth, guardianName, guardianPhone, status } = req.body;

        const student = await Student.findOne({ _id: id, isDeleted: false });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (name) student.name = name;
        if (email) student.email = email;
        if (phone !== undefined) student.phone = phone;
        if (course) {
            const courseDoc = await Course.findOne({ _id: course, isDeleted: false });
            if (!courseDoc) {
                return res.status(404).json({ message: "Course not found" });
            }
            student.course = courseDoc._id;
        }
        if (address !== undefined) student.address = address;
        if (dateOfBirth) student.dateOfBirth = dateOfBirth;
        if (guardianName !== undefined) student.guardianName = guardianName;
        if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;
        if (status) student.status = status;

        await student.save();

        const populatedStudent = await Student.findById(student._id)
            .populate("course", "title category price level");

        res.status(200).json({
            message: "Student updated successfully",
            student: populatedStudent,
        });
    } catch (error) {
        console.error("Update student error:", error);
        res.status(500).json({ message: "Internal server error" });
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

        res.status(200).json({
            message: "Student status updated",
            isActive: student.isActive,
        });
    } catch (error) {
        console.error("Toggle student status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student moved to trash", student });
    } catch (error) {
        console.error("Soft delete student error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student restored successfully", student });
    } catch (error) {
        console.error("Restore student error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedStudents = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { adhaar: { $regex: search, $options: "i" } },
                ],
            }
            : {};
        const filter = { isDeleted: true, ...searchQuery };
        const totalStudents = await Student.countDocuments(filter);
        const students = await Student.find(filter)
            .populate("course", "title category price level")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            students,
            totalStudents,
            page,
            limit,
            totalPages: Math.ceil(totalStudents / limit),
        });
    } catch (error) {
        console.error("Get deleted students error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
