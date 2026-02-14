

const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const studentCtrl = require("../controllers/student.controller");
const allowRoles = require("../middleware/role.middleware");

router.get("/me", authenticate, allowRoles("student"), studentCtrl.getMeStudent);

router.get("/all", studentCtrl.allStudents);
router.get("/trash/list", studentCtrl.getDeletedStudents);


router.get("/:id", studentCtrl.getStudentById);
router.put("/:id", studentCtrl.updateStudent);
router.patch("/:id/toggle-status", studentCtrl.toggleStudentStatus);
router.delete("/:id", studentCtrl.softDeleteStudent);
router.patch("/:id/restore", studentCtrl.restoreStudent);

module.exports = router;



