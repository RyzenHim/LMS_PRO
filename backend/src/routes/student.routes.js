const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const studentCtrl = require("../controllers/student.controller");

router.get("/all", studentCtrl.allStudents);
router.get("/trash/list", studentCtrl.getDeletedStudents);
router.get("/:id", studentCtrl.getStudentById);
router.post("/add", studentCtrl.addStudent);
router.put("/:id", studentCtrl.updateStudent);
router.patch("/:id/toggle-status", studentCtrl.toggleStudentStatus);
router.delete("/:id", studentCtrl.softDeleteStudent);
router.patch("/:id/restore", studentCtrl.restoreStudent);

module.exports = router;
