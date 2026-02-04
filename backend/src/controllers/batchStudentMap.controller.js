const Batch = require("../models/batch.model");
const Student = require("../models/student.model");
const BatchStudentMap = require("../models/batchStudentMap.model");

// ✅ Get all students in a batch
exports.getStudentsOfBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const mappings = await BatchStudentMap.find({
            batch: batchId,
            status: "active",
            isDeleted: false,
        })
            .populate("student", "name email phone status")
            .sort({ createdAt: -1 });

        return res.status(200).json(mappings);
    } catch (error) {
        console.error("getStudentsOfBatch error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get all batches of a student
exports.getBatchesOfStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const mappings = await BatchStudentMap.find({
            student: studentId,
            status: "active",
            isDeleted: false,
        })
            .populate("batch", "name startDate endDate status isActive")
            .populate("course", "title category level")
            .populate("tutor", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json(mappings);
    } catch (error) {
        console.error("getBatchesOfStudent error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Add students to batch (bulk)
exports.addStudentsToBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { students } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: "Students array is required" });
        }

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Optional: prevent adding into inactive batch
        // if (!batch.isActive) {
        //   return res.status(400).json({ message: "Batch is disabled" });
        // }

        // Validate students exist
        const validStudents = await Student.find({
            _id: { $in: students },
            isDeleted: false,
        }).select("_id");

        const validStudentIds = validStudents.map((s) => s._id.toString());

        if (validStudentIds.length === 0) {
            return res.status(400).json({ message: "No valid students found" });
        }

        // Prepare docs
        const docs = validStudentIds.map((studentId) => ({
            batch: batch._id,
            student: studentId,
            course: batch.course,
            tutor: batch.tutor,
            addedBy: req.user?._id || null, // if auth middleware exists
            status: "active",
            joinedAt: new Date(),
        }));

        /**
         * insertMany ordered:false:
         * - if duplicate mapping exists, it will skip that and continue
         */
        let inserted = 0;

        try {
            const result = await BatchStudentMap.insertMany(docs, { ordered: false });
            inserted = result.length;
        } catch (err) {
            // duplicates will throw error but still insert others
            // We ignore duplicates safely.
            if (err?.writeErrors) {
                inserted = docs.length - err.writeErrors.length;
            } else {
                console.error("insertMany error:", err);
            }
        }

        return res.status(200).json({
            message: "Students added to batch",
            addedCount: inserted,
            totalRequested: docs.length,
        });
    } catch (error) {
        console.error("addStudentsToBatch error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.removeStudentsFromBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { students } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: "Students array is required" });
        }

        const result = await BatchStudentMap.updateMany(
            {
                batch: batchId,
                student: { $in: students },
                status: "active",
                isDeleted: false,
            },
            {
                $set: {
                    status: "removed",
                    removedAt: new Date(),
                },
            }
        );

        return res.status(200).json({
            message: "Students removed from batch",
            removedCount: result.modifiedCount || 0,
        });
    } catch (error) {
        console.error("removeStudentsFromBatch error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

