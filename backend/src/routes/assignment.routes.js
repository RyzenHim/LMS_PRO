const router = require("express").Router();

const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");
const assignmentCtrl = require("../controllers/assignment.controller");

router.get("/my", authenticate, allowRoles("tutor", "admin"), assignmentCtrl.getMyAssignments);
router.get(
    "/student/me",
    authenticate,
    allowRoles("student"),
    assignmentCtrl.getStudentAssignments
);

router.post("/", authenticate, allowRoles("tutor", "admin"), assignmentCtrl.createAssignment);
router.put("/:id", authenticate, allowRoles("tutor", "admin"), assignmentCtrl.updateAssignment);
router.delete("/:id", authenticate, allowRoles("tutor", "admin"), assignmentCtrl.softDeleteAssignment);
router.patch("/:id/restore", authenticate, allowRoles("admin"), assignmentCtrl.restoreAssignment);

module.exports = router;
