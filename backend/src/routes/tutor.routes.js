const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const tutorCtrl = require("../controllers/tutor.controller");

router.get("/all", tutorCtrl.allTutors);
router.post("/add", tutorCtrl.addTutor);
router.put("/:id", tutorCtrl.updateTutor);
router.patch(
    "/:id/toggle-status",
    tutorCtrl.toggleTutorStatus
);

module.exports = router;
