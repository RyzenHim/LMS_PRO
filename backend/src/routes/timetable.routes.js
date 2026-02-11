const router = require("express").Router();
const timetableCtrl = require("../controllers/timetable.controller");

router.post("/add", timetableCtrl.createSlot);
router.get("/batch/:batchId", timetableCtrl.getBatchTimetable);
router.put("/:id", timetableCtrl.updateSlot);
router.delete("/:id", timetableCtrl.deleteSlot);

module.exports = router;
