const Student = require("../models/student.model");

exports.studentReport = async (req, res) => {
    try {
        const { course, batch, status, from, to, search } = req.query;

        const filter = { isDeleted: false };

        if (course) filter.course = course;
        if (batch) filter.batch = batch;
        if (status) filter.status = status;

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }

        const students = await Student.find(filter)
            .populate("course", "title")
            .populate("batch", "name");

        res.status(200).json({ students, total: students.length });
    } catch (err) {
        console.log("Student report error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
