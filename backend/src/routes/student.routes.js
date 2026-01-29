const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const studentCtrl = require("../controllers/student.controller");

router.get("/all", studentCtrl.allStudents);
router.post("/add", studentCtrl.addStudent);
router.put("/:id", studentCtrl.updateStudent);
router.patch(
    "/:id/toggle-status",
    studentCtrl.toggleStudentStatus
);
// router.get("/all", authenticate, allowRoles("admin"), studentCtrl.allStudents);
// router.post("/add", authenticate, allowRoles("admin"), studentCtrl.addStudent);
// router.put("/:id", authenticate, allowRoles("admin"), studentCtrl.updateStudent);
// router.patch(
//     "/:id/toggle-status",
//     authenticate,
//     allowRoles("admin"),
//     studentCtrl.toggleStudentStatus
// );

module.exports = router;
