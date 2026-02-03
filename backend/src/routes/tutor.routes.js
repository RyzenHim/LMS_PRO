const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const tutorCtrl = require("../controllers/tutor.controller");

router.get("/all", tutorCtrl.allTutors);
router.get("/trash/list", tutorCtrl.getDeletedTutors);
router.get("/:id", tutorCtrl.getTutorById);
router.post("/add", tutorCtrl.addTutor);
router.put("/:id", tutorCtrl.updateTutor);
router.patch("/:id/toggle-status", tutorCtrl.toggleTutorStatus);
router.delete("/:id", tutorCtrl.softDeleteTutor);
router.patch("/:id/restore", tutorCtrl.restoreTutor);

module.exports = router;
