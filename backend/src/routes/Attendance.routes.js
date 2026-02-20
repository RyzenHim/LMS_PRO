const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
    getBatchStudents,
    getAttendanceByBatchAndDate,
    markAttendance,
    markSingleStudentAttendance,
    getBatchAttendanceSummary,
} = require("../controllers/Attendance.controller");

router.use(authenticate);

// GET students in a batch
// GET /attendance/batch/:batchId/students
router.get("/batch/:batchId/students", allowRoles("admin", "hr", "tutor"), getBatchStudents);

// GET attendance for a batch on a date
// GET /attendance/batch/:batchId?date=YYYY-MM-DD
router.get("/batch/:batchId", allowRoles("admin", "hr", "tutor"), getAttendanceByBatchAndDate);

// GET attendance summary for a batch (all dates)
// GET /attendance/batch/:batchId/summary
router.get("/batch/:batchId/summary", allowRoles("admin", "hr", "tutor"), getBatchAttendanceSummary);

// POST mark all students attendance for a batch+date
// POST /attendance/batch/:batchId/mark
router.post("/batch/:batchId/mark", allowRoles("admin", "hr", "tutor"), markAttendance);

// PATCH mark single student attendance
// PATCH /attendance/batch/:batchId/student/:studentId
router.patch("/batch/:batchId/student/:studentId", allowRoles("admin", "hr", "tutor"), markSingleStudentAttendance);

module.exports = router;