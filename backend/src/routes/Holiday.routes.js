const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

const {
    getHolidaysByBatch,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    deleteHolidayByDate,
} = require("../controllers/Holiday.controller");

router.use(authenticate);
router.use(allowRoles("admin", "hr"));

// GET all holidays for a batch
router.get("/batch/:batchId", getHolidaysByBatch);

// POST add holiday for a batch+date
router.post("/batch/:batchId", addHoliday);

// PUT update holiday label/type
router.put("/:id", updateHoliday);

// DELETE holiday by its _id
router.delete("/:id", deleteHoliday);

// DELETE holiday by batch+date (convenient shortcut)
router.delete("/batch/:batchId/date/:date", deleteHolidayByDate);

module.exports = router;