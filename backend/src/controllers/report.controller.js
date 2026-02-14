const Student = require("../models/student.model");
const BatchStudentMap = require("../models/batchStudentMap.model");

exports.studentReport = async (req, res) => {
    try {
        const { course, batch, status, from, to, search } = req.query;

        const studentFilter = { isDeleted: false };

        if (status) studentFilter.status = status;

        if (from || to) {
            studentFilter.createdAt = {};
            if (from) studentFilter.createdAt.$gte = new Date(from);
            if (to) studentFilter.createdAt.$lte = new Date(to);
        }

        const students = await Student.find(studentFilter)
            .populate({
                path: "visitor",
                select: "name email phone course",
                match: {
                    ...(course ? { course } : {}),
                    ...(search
                        ? {
                            $or: [
                                { name: { $regex: search, $options: "i" } },
                                { email: { $regex: search, $options: "i" } },
                                { phone: { $regex: search, $options: "i" } },
                            ],
                        }
                        : {}),
                },
            })
            .sort({ createdAt: -1 });

        const filteredStudents = students.filter((s) => s.visitor);

        if (!batch) {
            return res.status(200).json({
                students: filteredStudents,
                total: filteredStudents.length,
            });
        }

        const studentIds = filteredStudents.map((s) => s._id);

        const mappings = await BatchStudentMap.find({
            student: { $in: studentIds },
            batch,
            status: "active",
            isDeleted: false,
        }).select("student");

        const allowedSet = new Set(mappings.map((m) => m.student.toString()));

        const finalStudents = filteredStudents.filter((s) =>
            allowedSet.has(s._id.toString())
        );

        return res.status(200).json({
            students: finalStudents,
            total: finalStudents.length,
        });
    } catch (err) {
        console.log("Student report error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
