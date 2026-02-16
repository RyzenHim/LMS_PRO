const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");
const reportCtrl = require("../controllers/report.controller");

router.get("/students", authenticate, allowRoles("admin"), reportCtrl.studentReport);
router.get("/batch", authenticate, allowRoles("admin"), reportCtrl.batchReport);
router.get("/courses", authenticate, allowRoles("admin"), reportCtrl.courseReport);
router.get("/fees", authenticate, allowRoles("admin"), reportCtrl.feesReport);
router.get("/tutors", authenticate, allowRoles("admin"), reportCtrl.tutorReport);
router.get("/employees", authenticate, allowRoles("admin"), reportCtrl.employeeReport);
router.get("/skills", authenticate, allowRoles("admin"), reportCtrl.skillReport);
router.get("/timetable", authenticate, allowRoles("admin"), reportCtrl.timetableReport);
router.get("/visitors", authenticate, allowRoles("admin"), reportCtrl.visitorReport);

module.exports = router;
