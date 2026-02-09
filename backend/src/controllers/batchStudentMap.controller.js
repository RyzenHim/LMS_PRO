const Batch = require("../models/batch.model");
const Student = require("../models/student.model");
const BatchStudentMap = require("../models/batchStudentMap.model");

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

exports.getBatchesOfStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const includeHistory = req.query?.includeHistory === "true";

        const query = {
            student: studentId,
            isDeleted: false,
        };

        if (!includeHistory) {
            query.status = "active";
        }

        const mappings = await BatchStudentMap.find(query)
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

        const docs = validStudentIds.map((studentId) => ({
            batch: batch._id,
            student: studentId,
            course: batch.course,
            tutor: batch.tutor,
            addedBy: req.user?._id || null, // if auth middleware exists
            status: "active",
            joinedAt: new Date(),
        }));

        let inserted = 0;

        try {
            const result = await BatchStudentMap.insertMany(docs, { ordered: false });
            inserted = result.length;
        } catch (err) {
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

exports.changeStudentBatch = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { fromBatchId, toBatchId } = req.body;

        if (!toBatchId) {
            return res.status(400).json({ message: "Target batch is required" });
        }

        const targetBatch = await Batch.findOne({ _id: toBatchId, isDeleted: false });
        if (!targetBatch) {
            return res.status(404).json({ message: "Target batch not found" });
        }

        const student = await Student.findOne({ _id: studentId, isDeleted: false });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const activeQuery = {
            student: studentId,
            status: "active",
            isDeleted: false,
        };

        if (fromBatchId) {
            activeQuery.batch = fromBatchId;
        }

        await BatchStudentMap.updateMany(activeQuery, {
            $set: {
                status: "removed",
                removedAt: new Date(),
            },
        });

        const existingActive = await BatchStudentMap.findOne({
            student: studentId,
            batch: targetBatch._id,
            status: "active",
            isDeleted: false,
        });

        if (existingActive) {
            return res.status(200).json({
                message: "Student already in target batch",
                mapping: existingActive,
            });
        }

        const mapping = await BatchStudentMap.create({
            batch: targetBatch._id,
            student: studentId,
            course: targetBatch.course,
            tutor: targetBatch.tutor,
            addedBy: req.user?._id || null,
            status: "active",
            joinedAt: new Date(),
        });

        const populated = await BatchStudentMap.findById(mapping._id)
            .populate("batch", "name startDate endDate status isActive")
            .populate("course", "title category level")
            .populate("tutor", "name email")
            .populate("student", "name email phone status");

        return res.status(200).json({
            message: "Student batch changed successfully",
            mapping: populated,
        });
    } catch (error) {
        console.error("changeStudentBatch error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.allBatches = async (req, res) => {
    try {
        const totalBatches = await Batch.countDocuments()
        return res.status(200).json({ totalBatches })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });

    }
}
