const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
    getBatchStudents,
    getAttendanceByBatchAndDate,
    markAttendance,
    markSingleStudentAttendance,
    getBatchDashboard,
    getBatchAttendanceSummary,
} = require("../controllers/Attendance.controller");

router.use(authenticate);

// GET students enrolled in a batch
router.get("/batch/:batchId/students", allowRoles("admin", "hr", "tutor"), getBatchStudents);

// GET full analytics dashboard (daily register + student stats + calendar)
// GET /attendance/batch/:batchId/dashboard?threshold=75
router.get("/batch/:batchId/dashboard", allowRoles("admin", "hr", "tutor"), getBatchDashboard);

// GET legacy summary
router.get("/batch/:batchId/summary", allowRoles("admin", "hr", "tutor"), getBatchAttendanceSummary);

// GET attendance for a specific date
// GET /attendance/batch/:batchId?date=YYYY-MM-DD
router.get("/batch/:batchId", allowRoles("admin", "hr", "tutor"), getAttendanceByBatchAndDate);

// POST mark all students for a date
router.post("/batch/:batchId/mark", allowRoles("admin", "hr", "tutor"), markAttendance);

// PATCH mark single student
router.patch("/batch/:batchId/student/:studentId", allowRoles("admin", "hr", "tutor"), markSingleStudentAttendance);

module.exports = router;