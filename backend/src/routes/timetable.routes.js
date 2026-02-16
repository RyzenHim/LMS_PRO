const router = require("express").Router();
const timetableCtrl = require("../controllers/timetable.controller");
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.post("/add", authenticate, allowRoles("admin", "hr"), timetableCtrl.createSlot);
router.get("/batch/:batchId", authenticate, timetableCtrl.getBatchTimetable);
router.put("/:id", authenticate, allowRoles("admin", "hr"), timetableCtrl.updateSlot);
router.delete("/:id", authenticate, allowRoles("admin", "hr"), timetableCtrl.deleteSlot);

module.exports = router;
