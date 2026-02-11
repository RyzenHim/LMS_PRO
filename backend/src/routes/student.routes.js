// const router = require("express").Router();
// const authenticate = require("../middleware/auth.middleware");
// const studentCtrl = require("../controllers/student.controller");
// const allowRoles = require("../middleware/role.middleware");
// router.get("/all", studentCtrl.allStudents);
// router.get("/trash/list", studentCtrl.getDeletedStudents);
// router.get("/:id", studentCtrl.getStudentById);
// router.post("/add", studentCtrl.addStudent);
// router.put("/:id", studentCtrl.updateStudent);
// router.patch("/:id/toggle-status", studentCtrl.toggleStudentStatus);
// router.delete("/:id", studentCtrl.softDeleteStudent);
// router.patch("/:id/restore", studentCtrl.restoreStudent);
// router.get("/me", authenticate, allowRoles("student"), studentCtrl.getMeStudent);
// router.get("/timetable", protect, studentOnly, getMyTimetable);




const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const studentCtrl = require("../controllers/student.controller");
const allowRoles = require("../middleware/role.middleware");

router.get("/me", authenticate, allowRoles("student"), studentCtrl.getMeStudent);
router.get("/timetable", authenticate, allowRoles("student"), studentCtrl.getMyTimetable);

router.get("/all", studentCtrl.allStudents);
router.get("/trash/list", studentCtrl.getDeletedStudents);

router.post("/add", studentCtrl.addStudent);

router.get("/:id", studentCtrl.getStudentById);
router.put("/:id", studentCtrl.updateStudent);
router.patch("/:id/toggle-status", studentCtrl.toggleStudentStatus);
router.delete("/:id", studentCtrl.softDeleteStudent);
router.patch("/:id/restore", studentCtrl.restoreStudent);
router.get("/timetable", authenticate, allowRoles("student"), studentCtrl.getMyTimetable);

module.exports = router;

