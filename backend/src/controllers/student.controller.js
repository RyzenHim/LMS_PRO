const Student = require('../models/employee.model');

exports.allStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addStudent = async (req, res) => {
    try {
        const { name, email, course } = req.body;

        if (!name || !email || !course) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await Student.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Student already exists" });
        }

        const student = await Student.create({ name, email, course });

        res.status(201).json({
            message: "Student added successfully",
            student,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, course } = req.body;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (name) student.name = name;
        if (email) student.email = email;
        if (course) student.course = course;

        await student.save();

        res.status(200).json({
            message: "Student updated",
            student,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleStudentStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        student.isActive = !student.isActive;
        await student.save();

        res.status(200).json({
            message: "Student status updated",
            isActive: student.isActive,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};
