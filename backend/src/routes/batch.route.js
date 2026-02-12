const express = require("express");
const router = express.Router();

const {
    getAllBatches,
    getDeletedBatches,
    createBatch,
    updateBatch,
    softDeleteBatch,
    restoreBatch,
    toggleBatchStatus,
    allBatchesWithCount,
    getBatchesByCourse,
} = require("../controllers/batch.controller");

router.get("/", getAllBatches);
router.get("/deleted", getDeletedBatches);

router.post("/", createBatch);

router.put("/:id", updateBatch);
router.put("/restore/:id", restoreBatch);
router.put("/toggle-status/:id", toggleBatchStatus);
router.get("/all", allBatchesWithCount);

router.delete("/:id", softDeleteBatch);
router.get("/by-course/:courseId", getBatchesByCourse);

module.exports = router;
