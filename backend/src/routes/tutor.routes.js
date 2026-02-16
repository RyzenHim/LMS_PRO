const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");
const tutorCtrl = require("../controllers/tutor.controller");

router.get("/me/dashboard", authenticate, allowRoles("tutor"), tutorCtrl.getMeTutorDashboard);
router.get("/me/students", authenticate, allowRoles("tutor"), tutorCtrl.getMeStudents);
router.get("/all", authenticate, allowRoles("admin", "hr"), tutorCtrl.allTutors);
router.get("/trash/list", authenticate, allowRoles("admin", "hr"), tutorCtrl.getDeletedTutors);
router.get("/:id", authenticate, allowRoles("admin", "hr"), tutorCtrl.getTutorById);
router.post("/add", authenticate, allowRoles("admin"), tutorCtrl.addTutor);
router.put("/:id", authenticate, allowRoles("admin"), tutorCtrl.updateTutor);
router.patch("/:id/toggle-status", authenticate, allowRoles("admin"), tutorCtrl.toggleTutorStatus);
router.delete("/:id", authenticate, allowRoles("admin"), tutorCtrl.softDeleteTutor);
router.patch("/:id/restore", authenticate, allowRoles("admin"), tutorCtrl.restoreTutor);

module.exports = router;
