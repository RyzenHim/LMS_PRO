const Attendance = require("../models/attendance.model");
const Batch = require("../models/batch.model");
const BatchStudentMap = require("../models/batchStudentMap.model");
const Student = require("../models/student.model");
const Visitor = require("../models/visitor.model");

// ─────────────────────────────────────────────
// GET students for a batch (for the attendance table)
// GET /attendance/batch/:batchId/students
// ─────────────────────────────────────────────
exports.getBatchStudents = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const mappings = await BatchStudentMap.find({
            batch: batchId,
            status: "active",
            isDeleted: false,
        })
            .populate({
                path: "student",
                match: { isDeleted: false },
                select: "visitor adhaar status isActive",
                populate: {
                    path: "visitor",
                    select: "name email phone",
                },
            })
            .lean();

        const students = mappings
            .filter((m) => m.student && m.student.visitor)
            .map((m) => ({
                _id: m.student._id,
                name: m.student.visitor.name,
                email: m.student.visitor.email || "",
                phone: m.student.visitor.phone || "",
                adhaar: m.student.adhaar || "",
                status: m.student.status,
                isActive: m.student.isActive,
            }));

        return res.status(200).json({ students, total: students.length });
    } catch (err) {
        console.error("getBatchStudents error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// GET attendance for a batch on a specific date
// GET /attendance/batch/:batchId?date=YYYY-MM-DD
// ─────────────────────────────────────────────
exports.getAttendanceByBatchAndDate = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { date } = req.query;

        if (!date) return res.status(400).json({ message: "date query param is required (YYYY-MM-DD)" });

        const attendance = await Attendance.findOne({ batch: batchId, date })
            .populate({
                path: "records.student",
                select: "visitor",
                populate: { path: "visitor", select: "name email" },
            })
            .lean();

        if (!attendance) {
            return res.status(404).json({ message: "No attendance record for this date", records: [] });
        }

        return res.status(200).json({
            _id: attendance._id,
            batch: attendance.batch,
            date: attendance.date,
            records: attendance.records,
        });
    } catch (err) {
        console.error("getAttendanceByBatchAndDate error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// MARK / UPDATE attendance for a batch on a date
// POST /attendance/batch/:batchId/mark
// Body: { date: "YYYY-MM-DD", records: [{ student: id, status: "present"|"absent"|"present-online" }] }
// ─────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { date, records } = req.body;

        if (!date) return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ message: "records array is required" });
        }

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        // Validate statuses
        const allowedStatuses = ["present", "absent", "present-online"];
        for (const r of records) {
            if (!r.student) return res.status(400).json({ message: "Each record must have a student id" });
            if (!allowedStatuses.includes(r.status)) {
                return res.status(400).json({
                    message: `Invalid status "${r.status}". Allowed: ${allowedStatuses.join(", ")}`,
                });
            }
        }

        // Upsert: create or update attendance for this batch+date
        const attendance = await Attendance.findOneAndUpdate(
            { batch: batchId, date },
            {
                $set: {
                    batch: batchId,
                    date,
                    records,
                    markedBy: req.user?._id || null,
                },
            },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Attendance saved successfully",
            attendance,
        });
    } catch (err) {
        console.error("markAttendance error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// MARK single student attendance
// PATCH /attendance/batch/:batchId/student/:studentId
// Body: { date: "YYYY-MM-DD", status: "present"|"absent"|"present-online" }
// ─────────────────────────────────────────────
exports.markSingleStudentAttendance = async (req, res) => {
    try {
        const { batchId, studentId } = req.params;
        const { date, status } = req.body;

        if (!date) return res.status(400).json({ message: "date is required" });

        const allowedStatuses = ["present", "absent", "present-online"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
        }

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        // Find existing attendance doc or create one
        let attendance = await Attendance.findOne({ batch: batchId, date });

        if (!attendance) {
            attendance = new Attendance({ batch: batchId, date, records: [], markedBy: req.user?._id });
        }

        // Update or insert the student record
        const idx = attendance.records.findIndex(
            (r) => r.student.toString() === studentId
        );

        if (idx >= 0) {
            attendance.records[idx].status = status;
        } else {
            attendance.records.push({ student: studentId, status });
        }

        await attendance.save();

        return res.status(200).json({
            message: "Student attendance updated",
            attendance,
        });
    } catch (err) {
        console.error("markSingleStudentAttendance error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// GET attendance summary for a batch (all dates)
// GET /attendance/batch/:batchId/summary
// ─────────────────────────────────────────────
exports.getBatchAttendanceSummary = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const records = await Attendance.find({ batch: batchId })
            .sort({ date: 1 })
            .lean();

        return res.status(200).json({
            batchId,
            totalDays: records.length,
            records,
        });
    } catch (err) {
        console.error("getBatchAttendanceSummary error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};