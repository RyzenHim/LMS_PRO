// const Attendance = require("../models/attendance.model");
// const Holiday = require("../models/Holiday.model");
// const Batch = require("../models/batch.model");
// const BatchStudentMap = require("../models/batchStudentMap.model");
// const Timetable = require("../models/timetable.model");
// const dayjs = require("dayjs");
// const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
// dayjs.extend(isSameOrBefore);

// // ─── Internal helper: all dates between start and end (inclusive) ───
// const getDatesBetween = (start, end) => {
//     const s = dayjs(start);
//     const e = dayjs(end);
//     if (!s.isValid() || !e.isValid()) return [];
//     const dates = [];
//     let cur = s;
//     while (cur.isSameOrBefore(e, "day")) {
//         dates.push(cur.format("YYYY-MM-DD"));
//         cur = cur.add(1, "day");
//     }
//     return dates;
// };

// // ─── Internal helper: fetch enrolled students for a batch ───
// const fetchBatchStudentList = async (batchId) => {
//     const mappings = await BatchStudentMap.find({
//         batch: batchId,
//         status: "active",
//         isDeleted: false,
//     })
//         .populate({
//             path: "student",
//             match: { isDeleted: false },
//             select: "visitor adhaar status isActive",
//             populate: { path: "visitor", select: "name email phone" },
//         })
//         .lean();

//     return mappings
//         .filter((m) => m.student && m.student.visitor)
//         .map((m) => ({
//             _id: m.student._id.toString(),
//             name: m.student.visitor.name,
//             email: m.student.visitor.email || "",
//             phone: m.student.visitor.phone || "",
//             adhaar: m.student.adhaar || "",
//             status: m.student.status,
//             isActive: m.student.isActive,
//         }));
// };

// // ─────────────────────────────────────────────
// // GET students enrolled in a batch
// // GET /attendance/batch/:batchId/students
// // ─────────────────────────────────────────────
// exports.getBatchStudents = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
//         if (!batch) return res.status(404).json({ message: "Batch not found" });

//         const students = await fetchBatchStudentList(batchId);
//         return res.status(200).json({ students, total: students.length });
//     } catch (err) {
//         console.error("getBatchStudents error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

// // ─────────────────────────────────────────────
// // GET attendance for a batch on a specific date
// // GET /attendance/batch/:batchId?date=YYYY-MM-DD
// // ─────────────────────────────────────────────
// // exports.getAttendanceByBatchAndDate = async (req, res) => {
// //     try {
// //         const { batchId } = req.params;
// //         const { date } = req.query;

// //         if (!date) return res.status(400).json({ message: "date query param required (YYYY-MM-DD)" });

// //         const [attendance, holiday] = await Promise.all([
// //             Attendance.findOne({ batch: batchId, date }).lean(),
// //             Holiday.findOne({ batch: batchId, date }).lean(),
// //         ]);

// //         if (!attendance) {
// //             return res.status(404).json({
// //                 message: "No attendance record for this date",
// //                 records: [],
// //                 holiday: holiday || null,
// //             });
// //         }

// //         return res.status(200).json({
// //             _id: attendance._id,
// //             batch: attendance.batch,
// //             date: attendance.date,
// //             records: attendance.records,
// //             holiday: holiday || null,
// //         });
// //     } catch (err) {
// //         console.error("getAttendanceByBatchAndDate error:", err);
// //         return res.status(500).json({ message: "Internal server error" });
// //     }
// // };
// exports.getAttendanceByBatchAndDate = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const { date } = req.query;

//         if (!date) {
//             return res.status(400).json({ message: "date query param required (YYYY-MM-DD)" });
//         }

//         const attendance = await Attendance.findOne({ batch: batchId, date }).lean();
//         const holiday = await Holiday.findOne({ batch: batchId, date }).lean();

//         return res.status(200).json({
//             records: attendance?.records || [],           // empty array if none
//             holiday: holiday || null,
//             marked: !!attendance,                         // tells frontend if already saved
//         });
//     } catch (err) {
//         console.error("getAttendanceByBatchAndDate error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };
// // ─────────────────────────────────────────────
// // MARK all students attendance on a date (upsert)
// // POST /attendance/batch/:batchId/mark
// // Body: { date, records: [{ student, status }] }
// // ─────────────────────────────────────────────
// // exports.markAttendance = async (req, res) => {
// //     try {
// //         const { batchId } = req.params;
// //         const { date, records } = req.body;

// //         if (!date) return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
// //         if (!Array.isArray(records) || records.length === 0) {
// //             return res.status(400).json({ message: "records array is required" });
// //         }

// //         const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
// //         if (!batch) return res.status(404).json({ message: "Batch not found" });

// //         // Block marking on holidays
// //         const holiday = await Holiday.findOne({ batch: batchId, date });
// //         if (holiday) {
// //             return res.status(400).json({
// //                 message: `Cannot mark attendance on a holiday: "${holiday.label}"`,
// //             });
// //         }

// //         const allowedStatuses = ["present", "absent", "present-online"];
// //         for (const r of records) {
// //             if (!r.student) return res.status(400).json({ message: "Each record must have a student id" });
// //             if (!allowedStatuses.includes(r.status)) {
// //                 return res.status(400).json({
// //                     message: `Invalid status "${r.status}". Allowed: ${allowedStatuses.join(", ")}`,
// //                 });
// //             }
// //         }

// //         const attendance = await Attendance.findOneAndUpdate(
// //             { batch: batchId, date },
// //             { $set: { batch: batchId, date, records, markedBy: req.user?._id || null } },
// //             { upsert: true, new: true, runValidators: true }
// //         );

// //         return res.status(200).json({ message: "Attendance saved successfully", attendance });
// //     } catch (err) {
// //         console.error("markAttendance error:", err);
// //         return res.status(500).json({ message: err.message });
// //     }
// // };
// exports.markAttendance = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const { date, records } = req.body;

//         if (!date) return res.status(400).json({ message: "date required (YYYY-MM-DD)" });
//         if (!Array.isArray(records) || !records.length) {
//             return res.status(400).json({ message: "records array required" });
//         }

//         const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
//         if (!batch) return res.status(404).json({ message: "Batch not found" });

//         // Holiday check
//         const holiday = await Holiday.findOne({ batch: batchId, date });
//         if (holiday) {
//             return res.status(400).json({ message: `Cannot mark on holiday: "${holiday.label}"` });
//         }

//         // Validate statuses
//         const allowed = ["present", "absent", "present-online"];
//         for (const r of records) {
//             if (!r.student || !allowed.includes(r.status)) {
//                 return res.status(400).json({ message: "Invalid record format" });
//             }
//         }

//         // Upsert per batch + date (no slot)
//         const attendance = await Attendance.findOneAndUpdate(
//             { batch: batchId, date },
//             {
//                 $set: {
//                     batch: batchId,
//                     date,
//                     records,
//                     markedBy: req.user?._id || null,
//                 },
//             },
//             { upsert: true, new: true, runValidators: true }
//         );

//         return res.status(200).json({
//             message: "Attendance saved successfully",
//             attendance,
//         });
//     } catch (err) {
//         console.error("markAttendance error:", err);
//         return res.status(500).json({ message: err.message || "Server error" });
//     }
// };
// // ─────────────────────────────────────────────
// // MARK single student attendance
// // PATCH /attendance/batch/:batchId/student/:studentId
// // Body: { date, status }
// // ─────────────────────────────────────────────
// exports.markSingleStudentAttendance = async (req, res) => {
//     try {
//         const { batchId, studentId } = req.params;
//         const { date, status } = req.body;

//         if (!date) return res.status(400).json({ message: "date is required" });

//         const allowedStatuses = ["present", "absent", "present-online"];
//         if (!allowedStatuses.includes(status)) {
//             return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}` });
//         }

//         const holiday = await Holiday.findOne({ batch: batchId, date });
//         if (holiday) {
//             return res.status(400).json({ message: `Cannot mark on holiday: "${holiday.label}"` });
//         }

//         let attendance = await Attendance.findOne({ batch: batchId, date });
//         if (!attendance) {
//             attendance = new Attendance({ batch: batchId, date, records: [], markedBy: req.user?._id });
//         }

//         const idx = attendance.records.findIndex((r) => r.student.toString() === studentId);
//         if (idx >= 0) {
//             attendance.records[idx].status = status;
//         } else {
//             attendance.records.push({ student: studentId, status });
//         }

//         await attendance.save();
//         return res.status(200).json({ message: "Student attendance updated", attendance });
//     } catch (err) {
//         console.error("markSingleStudentAttendance error:", err);
//         return res.status(500).json({ message: err.message });
//     }
// };

// // ─────────────────────────────────────────────
// // GET full analytics dashboard for a batch
// // GET /attendance/batch/:batchId/dashboard?threshold=75
// // Returns: dailyRegister, studentStats (with %, at-risk), calendarData, holidays, summary
// // ─────────────────────────────────────────────
// exports.getBatchDashboard = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const timetableSlots = await Timetable.find({
//             batch: batchId,
//             isDeleted: false,
//         }).lean();
//         if (!timetableSlots.length) {
//             return res.status(400).json({
//                 message: "No timetable slots configured for this batch",
//             });
//         }
//         const weekdaySlotMap = {};

//         timetableSlots.forEach(slot => {
//             if (!weekdaySlotMap[slot.day]) {
//                 weekdaySlotMap[slot.day] = [];
//             }
//             weekdaySlotMap[slot.day].push(slot);
//         });
//         const AT_RISK_THRESHOLD = Number(req.query.threshold || 75);

//         const batch = await Batch.findOne({ _id: batchId, isDeleted: false })
//             .populate("course", "title")
//             .lean();
//         if (!batch) return res.status(404).json({ message: "Batch not found" });

//         // Date range: batch start → min(batch end, today)
//         const batchStart = batch.startDate;
//         const rawEnd = batch.endDate
//             ? dayjs(batch.endDate).isSameOrBefore(dayjs(), "day")
//                 ? batch.endDate
//                 : dayjs().format("YYYY-MM-DD")
//             : dayjs().format("YYYY-MM-DD");

//         const allDates = getDatesBetween(batchStart, rawEnd);

//         // Fetch all data in parallel
//         const [students, attendanceRecords, holidays] = await Promise.all([
//             fetchBatchStudentList(batchId),
//             Attendance.find({ batch: batchId }).sort({ date: 1 }).lean(),
//             Holiday.find({ batch: batchId }).sort({ date: 1 }).lean(),
//         ]);

//         const totalStudents = students.length;

//         // Build fast lookup maps
//         const holidayMap = {};
//         holidays.forEach((h) => { holidayMap[h.date] = h; });

//         const attendanceDayMap = {}; // date → { studentId → status }
//         attendanceRecords.forEach((a) => {
//             attendanceDayMap[a.date] = {};
//             a.records.forEach((r) => {
//                 attendanceDayMap[a.date][r.student.toString()] = r.status;
//             });
//         });

//         // Working days = all dates minus holidays
//         const workingDates = allDates.filter((d) => !holidayMap[d]);
//         const totalWorkingDays = workingDates.length;

//         // ── 1. DAILY REGISTER ──────────────────────────────
//         const dailyRegister = allDates.map((date) => {
//             const holiday = holidayMap[date] || null;

//             if (holiday) {
//                 return {
//                     date,
//                     isHoliday: true,
//                     holidayLabel: holiday.label,
//                     holidayType: holiday.type,
//                     present: 0,
//                     online: 0,
//                     absent: 0,
//                     unmarked: totalStudents,
//                     total: totalStudents,
//                     attendanceMarked: false,
//                     fullAttendance: false,
//                     presentPercent: 0,
//                 };
//             }

//             const dayMap = attendanceDayMap[date] || {};
//             let present = 0, online = 0, absent = 0;

//             students.forEach((s) => {
//                 const st = dayMap[s._id];
//                 if (st === "present") present++;
//                 else if (st === "present-online") online++;
//                 else if (st === "absent") absent++;
//             });

//             const totalPresent = present + online;
//             const unmarked = totalStudents - present - online - absent;
//             const attendanceMarked = Object.keys(dayMap).length > 0;
//             const fullAttendance = attendanceMarked && totalPresent === totalStudents && absent === 0;
//             const presentPercent = totalStudents > 0
//                 ? Math.round((totalPresent / totalStudents) * 100)
//                 : 0;

//             return {
//                 date,
//                 isHoliday: false,
//                 holidayLabel: null,
//                 holidayType: null,
//                 present,
//                 online,
//                 absent,
//                 unmarked,
//                 total: totalStudents,
//                 attendanceMarked,
//                 fullAttendance,
//                 presentPercent,
//             };
//         });

//         // ── 2. PER-STUDENT STATS with date heatmap ─────────
//         const studentStats = students.map((s) => {
//             let present = 0, online = 0, absent = 0, unmarked = 0;
//             const dateStatuses = {}; // date → status | null

//             workingDates.forEach((date) => {
//                 const st = (attendanceDayMap[date] || {})[s._id] || null;
//                 dateStatuses[date] = st;
//                 if (st === "present") present++;
//                 else if (st === "present-online") online++;
//                 else if (st === "absent") absent++;
//                 else unmarked++;
//             });

//             const totalPresent = present + online;
//             const markedDays = present + online + absent;

//             // % out of total working days (harshest — uncommitted = absent)
//             const attendancePct = totalWorkingDays > 0
//                 ? Math.round((totalPresent / totalWorkingDays) * 100)
//                 : 0;

//             // % out of marked days only (ignores unmarked)
//             const effectivePct = markedDays > 0
//                 ? Math.round((totalPresent / markedDays) * 100)
//                 : null;

//             const isAtRisk = markedDays > 0 && attendancePct < AT_RISK_THRESHOLD;

//             return {
//                 ...s,
//                 present,
//                 online,
//                 absent,
//                 unmarked,
//                 totalPresent,
//                 totalWorkingDays,
//                 markedDays,
//                 attendancePct,
//                 effectivePct,
//                 isAtRisk,
//                 dateStatuses,
//             };
//         });

//         // ── 3. CALENDAR DATA (compact for color-coded view) ─
//         const calendarData = {};
//         dailyRegister.forEach((reg) => {
//             calendarData[reg.date] = {
//                 isHoliday: reg.isHoliday,
//                 holidayLabel: reg.holidayLabel,
//                 attendanceMarked: reg.attendanceMarked,
//                 fullAttendance: reg.fullAttendance,
//                 presentPercent: reg.presentPercent,
//             };
//         });

//         // ── 4. OVERALL SUMMARY ────────────────────────────
//         const markedDaysCount = dailyRegister.filter((d) => !d.isHoliday && d.attendanceMarked).length;
//         const fullAttendanceDaysCount = dailyRegister.filter((d) => d.fullAttendance).length;
//         const atRiskCount = studentStats.filter((s) => s.isAtRisk).length;

//         return res.status(200).json({
//             batch: {
//                 _id: batch._id,
//                 name: batch.name,
//                 courseTitle: batch.course?.title || "",
//                 startDate: batch.startDate,
//                 endDate: batch.endDate,
//                 status: batch.status,
//             },
//             summary: {
//                 totalStudents,
//                 totalDays: allDates.length,
//                 workingDays: totalWorkingDays,
//                 holidayCount: holidays.length,
//                 markedDays: markedDaysCount,
//                 fullAttendanceDays: fullAttendanceDaysCount,
//                 atRiskStudents: atRiskCount,
//                 atRiskThreshold: AT_RISK_THRESHOLD,
//             },
//             dailyRegister,
//             studentStats,
//             holidays,
//             calendarData,
//         });
//     } catch (err) {
//         console.error("getBatchDashboard error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

// // ─────────────────────────────────────────────
// // Legacy summary endpoint
// // GET /attendance/batch/:batchId/summary
// // ─────────────────────────────────────────────
// exports.getBatchAttendanceSummary = async (req, res) => {
//     try {
//         const { batchId } = req.params;
//         const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
//         if (!batch) return res.status(404).json({ message: "Batch not found" });

//         const records = await Attendance.find({ batch: batchId }).sort({ date: 1 }).lean();
//         return res.status(200).json({ batchId, totalDays: records.length, records });
//     } catch (err) {
//         console.error("getBatchAttendanceSummary error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };


// exports.markAttendance = async (req, res) => {
//     try {
//         const { batchId, slotId } = req.params;
//         const { date, records } = req.body;

//         if (!date) return res.status(400).json({ message: "date required" });
//         if (!Array.isArray(records) || !records.length)
//             return res.status(400).json({ message: "records required" });

//         const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
//         if (!batch) return res.status(404).json({ message: "Batch not found" });

//         const slot = await Timetable.findOne({
//             _id: slotId,
//             batch: batchId,
//             isDeleted: false,
//         });

//         if (!slot) return res.status(404).json({ message: "Slot not found" });

//         // Validate date matches slot weekday
//         const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
//         const weekday = dayMap[dayjs(date).day()];
//         if (weekday !== slot.day) {
//             return res.status(400).json({
//                 message: "Selected date does not match slot weekday",
//             });
//         }

//         // Holiday check
//         const holiday = await Holiday.findOne({ batch: batchId, date });
//         if (holiday) {
//             return res.status(400).json({
//                 message: `Holiday: ${holiday.label}`,
//             });
//         }

//         const attendance = await Attendance.findOneAndUpdate(
//             { batch: batchId, date, slot: slotId },
//             {
//                 $set: {
//                     batch: batchId,
//                     date,
//                     slot: slotId,
//                     records,
//                     markedBy: req.user?._id || null,
//                 },
//             },
//             { upsert: true, new: true }
//         );

//         return res.status(200).json({
//             message: "Slot attendance saved",
//             attendance,
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

// exports.getSlotAttendance = async (req, res) => {
//     try {
//         const { batchId, slotId } = req.params;
//         const { date } = req.query;

//         const attendance = await Attendance.findOne({
//             batch: batchId,
//             slot: slotId,
//             date,
//         }).lean();

//         return res.status(200).json({
//             attendance: attendance || null,
//         });
//     } catch (err) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };


// exports.deleteSlotAttendance = async (req, res) => {
//     try {
//         const { batchId, slotId, date } = req.params;

//         await Attendance.findOneAndDelete({
//             batch: batchId,
//             slot: slotId,
//             date,
//         });

//         return res.status(200).json({
//             message: "Slot attendance deleted",
//         });
//     } catch (err) {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };



const Attendance = require("../models/Attendance.model");
const Holiday = require("../models/Holiday.model");
const Batch = require("../models/batch.model");
const BatchStudentMap = require("../models/batchStudentMap.model");
const Timetable = require("../models/timetable.model");
const dayjs = require("dayjs");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

// ─── Internal helper: all dates between start and end (inclusive) ───
const getDatesBetween = (start, end) => {
    const s = dayjs(start);
    const e = dayjs(end);
    if (!s.isValid() || !e.isValid()) return [];
    const dates = [];
    let cur = s;
    while (cur.isSameOrBefore(e, "day")) {
        dates.push(cur.format("YYYY-MM-DD"));
        cur = cur.add(1, "day");
    }
    return dates;
};

// ─── Internal helper: fetch enrolled students for a batch ───
const fetchBatchStudentList = async (batchId) => {
    const mappings = await BatchStudentMap.find({
        batch: batchId,
        status: "active",
        isDeleted: false,
    })
        .populate({
            path: "student",
            match: { isDeleted: false },
            select: "visitor adhaar status isActive",
            populate: { path: "visitor", select: "name email phone" },
        })
        .lean();

    return mappings
        .filter((m) => m.student && m.student.visitor)
        .map((m) => ({
            _id: m.student._id.toString(),
            name: m.student.visitor.name,
            email: m.student.visitor.email || "",
            phone: m.student.visitor.phone || "",
            adhaar: m.student.adhaar || "",
            status: m.student.status,
            isActive: m.student.isActive,
        }));
};

// ─────────────────────────────────────────────
// GET students enrolled in a batch
// GET /attendance/batch/:batchId/students
// ─────────────────────────────────────────────
exports.getBatchStudents = async (req, res) => {
    try {
        const { batchId } = req.params;
        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const students = await fetchBatchStudentList(batchId);
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

        if (!date) {
            return res.status(400).json({ message: "date query param required (YYYY-MM-DD)" });
        }

        const attendance = await Attendance.findOne({ batch: batchId, date }).lean();
        const holiday = await Holiday.findOne({ batch: batchId, date }).lean();

        return res.status(200).json({
            records: attendance?.records || [],           // empty array if none
            holiday: holiday || null,
            marked: !!attendance,                         // tells frontend if already saved
        });
    } catch (err) {
        console.error("getAttendanceByBatchAndDate error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// MARK all students attendance on a date (upsert)
// POST /attendance/batch/:batchId/mark
// Body: { date, records: [{ student, status }] }
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

        // Block marking on holidays
        const holiday = await Holiday.findOne({ batch: batchId, date });
        if (holiday) {
            return res.status(400).json({
                message: `Cannot mark attendance on a holiday: "${holiday.label}"`,
            });
        }

        const allowedStatuses = ["present", "absent", "present-online"];
        for (const r of records) {
            if (!r.student) return res.status(400).json({ message: "Each record must have a student id" });
            if (!allowedStatuses.includes(r.status)) {
                return res.status(400).json({
                    message: `Invalid status "${r.status}". Allowed: ${allowedStatuses.join(", ")}`,
                });
            }
        }

        const attendance = await Attendance.findOneAndUpdate(
            { batch: batchId, date },
            { $set: { batch: batchId, date, records, markedBy: req.user?._id || null } },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).json({ message: "Attendance saved successfully", attendance });
    } catch (err) {
        console.error("markAttendance error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// MARK single student attendance
// PATCH /attendance/batch/:batchId/student/:studentId
// Body: { date, status }
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

        const holiday = await Holiday.findOne({ batch: batchId, date });
        if (holiday) {
            return res.status(400).json({ message: `Cannot mark on holiday: "${holiday.label}"` });
        }

        let attendance = await Attendance.findOne({ batch: batchId, date });
        if (!attendance) {
            attendance = new Attendance({ batch: batchId, date, records: [], markedBy: req.user?._id });
        }

        const idx = attendance.records.findIndex((r) => r.student.toString() === studentId);
        if (idx >= 0) {
            attendance.records[idx].status = status;
        } else {
            attendance.records.push({ student: studentId, status });
        }

        await attendance.save();
        return res.status(200).json({ message: "Student attendance updated", attendance });
    } catch (err) {
        console.error("markSingleStudentAttendance error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// GET full analytics dashboard for a batch
// GET /attendance/batch/:batchId/dashboard?threshold=75
// Returns: dailyRegister, studentStats (with %, at-risk), calendarData, holidays, summary
// ─────────────────────────────────────────────
exports.getBatchDashboard = async (req, res) => {
    try {
        const { batchId } = req.params;
        const timetableSlots = await Timetable.find({
            batch: batchId,
            isDeleted: false,
        }).lean();
        if (!timetableSlots.length) {
            return res.status(400).json({
                message: "No timetable slots configured for this batch",
            });
        }
        const weekdaySlotMap = {};

        timetableSlots.forEach(slot => {
            if (!weekdaySlotMap[slot.day]) {
                weekdaySlotMap[slot.day] = [];
            }
            weekdaySlotMap[slot.day].push(slot);
        });
        const AT_RISK_THRESHOLD = Number(req.query.threshold || 75);

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false })
            .populate("course", "title")
            .lean();
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        // Date range: batch start → min(batch end, today)
        const batchStart = batch.startDate;
        const rawEnd = batch.endDate
            ? dayjs(batch.endDate).isSameOrBefore(dayjs(), "day")
                ? batch.endDate
                : dayjs().format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD");

        const allDates = getDatesBetween(batchStart, rawEnd);

        // Fetch all data in parallel
        const [students, attendanceRecords, holidays] = await Promise.all([
            fetchBatchStudentList(batchId),
            Attendance.find({ batch: batchId }).sort({ date: 1 }).lean(),
            Holiday.find({ batch: batchId }).sort({ date: 1 }).lean(),
        ]);

        const totalStudents = students.length;

        // Build fast lookup maps
        const holidayMap = {};
        holidays.forEach((h) => { holidayMap[h.date] = h; });

        const attendanceDayMap = {}; // date → { studentId → status }
        attendanceRecords.forEach((a) => {
            attendanceDayMap[a.date] = {};
            a.records.forEach((r) => {
                attendanceDayMap[a.date][r.student.toString()] = r.status;
            });
        });

        // Working days = all dates minus holidays
        const workingDates = allDates.filter((d) => !holidayMap[d]);
        const totalWorkingDays = workingDates.length;

        // ── 1. DAILY REGISTER ──────────────────────────────
        const dailyRegister = allDates.map((date) => {
            const holiday = holidayMap[date] || null;

            if (holiday) {
                return {
                    date,
                    isHoliday: true,
                    holidayLabel: holiday.label,
                    holidayType: holiday.type,
                    present: 0,
                    online: 0,
                    absent: 0,
                    unmarked: totalStudents,
                    total: totalStudents,
                    attendanceMarked: false,
                    fullAttendance: false,
                    presentPercent: 0,
                };
            }

            const dayMap = attendanceDayMap[date] || {};
            let present = 0, online = 0, absent = 0;

            students.forEach((s) => {
                const st = dayMap[s._id];
                if (st === "present") present++;
                else if (st === "present-online") online++;
                else if (st === "absent") absent++;
            });

            const totalPresent = present + online;
            const unmarked = totalStudents - present - online - absent;
            const attendanceMarked = Object.keys(dayMap).length > 0;
            const fullAttendance = attendanceMarked && totalPresent === totalStudents && absent === 0;
            const presentPercent = totalStudents > 0
                ? Math.round((totalPresent / totalStudents) * 100)
                : 0;

            return {
                date,
                isHoliday: false,
                holidayLabel: null,
                holidayType: null,
                present,
                online,
                absent,
                unmarked,
                total: totalStudents,
                attendanceMarked,
                fullAttendance,
                presentPercent,
            };
        });

        // ── 2. PER-STUDENT STATS with date heatmap ─────────
        const studentStats = students.map((s) => {
            let present = 0, online = 0, absent = 0, unmarked = 0;
            const dateStatuses = {}; // date → status | null

            workingDates.forEach((date) => {
                const st = (attendanceDayMap[date] || {})[s._id] || null;
                dateStatuses[date] = st;
                if (st === "present") present++;
                else if (st === "present-online") online++;
                else if (st === "absent") absent++;
                else unmarked++;
            });

            const totalPresent = present + online;
            const markedDays = present + online + absent;

            // % out of total working days (harshest — uncommitted = absent)
            const attendancePct = totalWorkingDays > 0
                ? Math.round((totalPresent / totalWorkingDays) * 100)
                : 0;

            // % out of marked days only (ignores unmarked)
            const effectivePct = markedDays > 0
                ? Math.round((totalPresent / markedDays) * 100)
                : null;

            const isAtRisk = markedDays > 0 && attendancePct < AT_RISK_THRESHOLD;

            return {
                ...s,
                present,
                online,
                absent,
                unmarked,
                totalPresent,
                totalWorkingDays,
                markedDays,
                attendancePct,
                effectivePct,
                isAtRisk,
                dateStatuses,
            };
        });

        // ── 3. CALENDAR DATA (compact for color-coded view) ─
        const calendarData = {};
        dailyRegister.forEach((reg) => {
            calendarData[reg.date] = {
                isHoliday: reg.isHoliday,
                holidayLabel: reg.holidayLabel,
                attendanceMarked: reg.attendanceMarked,
                fullAttendance: reg.fullAttendance,
                presentPercent: reg.presentPercent,
            };
        });

        // ── 4. OVERALL SUMMARY ────────────────────────────
        const markedDaysCount = dailyRegister.filter((d) => !d.isHoliday && d.attendanceMarked).length;
        const fullAttendanceDaysCount = dailyRegister.filter((d) => d.fullAttendance).length;
        const atRiskCount = studentStats.filter((s) => s.isAtRisk).length;

        return res.status(200).json({
            batch: {
                _id: batch._id,
                name: batch.name,
                courseTitle: batch.course?.title || "",
                startDate: batch.startDate,
                endDate: batch.endDate,
                status: batch.status,
            },
            summary: {
                totalStudents,
                totalDays: allDates.length,
                workingDays: totalWorkingDays,
                holidayCount: holidays.length,
                markedDays: markedDaysCount,
                fullAttendanceDays: fullAttendanceDaysCount,
                atRiskStudents: atRiskCount,
                atRiskThreshold: AT_RISK_THRESHOLD,
            },
            dailyRegister,
            studentStats,
            holidays,
            calendarData,
        });
    } catch (err) {
        console.error("getBatchDashboard error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// Legacy summary endpoint
// GET /attendance/batch/:batchId/summary
// ─────────────────────────────────────────────
exports.getBatchAttendanceSummary = async (req, res) => {
    try {
        const { batchId } = req.params;
        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const records = await Attendance.find({ batch: batchId }).sort({ date: 1 }).lean();
        return res.status(200).json({ batchId, totalDays: records.length, records });
    } catch (err) {
        console.error("getBatchAttendanceSummary error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getSlotAttendance = async (req, res) => {
    try {
        const { batchId, slotId } = req.params;
        const { date } = req.query;

        const attendance = await Attendance.findOne({
            batch: batchId,
            slot: slotId,
            date,
        }).lean();

        return res.status(200).json({
            attendance: attendance || null,
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.deleteSlotAttendance = async (req, res) => {
    try {
        const { batchId, slotId, date } = req.params;

        await Attendance.findOneAndDelete({
            batch: batchId,
            slot: slotId,
            date,
        });

        return res.status(200).json({
            message: "Slot attendance deleted",
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};