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
} = require("../controllers/batch.controller");

router.get("/", getAllBatches);
router.get("/deleted", getDeletedBatches);

router.post("/", createBatch);

router.put("/:id", updateBatch);
router.put("/restore/:id", restoreBatch);
router.put("/toggle-status/:id", toggleBatchStatus);
router.get("/all", allBatchesWithCount);

router.delete("/:id", softDeleteBatch);

module.exports = router;
