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
} = require("../controllers/batch.controller");

router.get("/", getAllBatches);
router.get("/deleted", getDeletedBatches);

router.post("/", createBatch);

router.put("/:id", updateBatch);
router.put("/restore/:id", restoreBatch);
router.put("/toggle-status/:id", toggleBatchStatus);

router.delete("/:id", softDeleteBatch);

module.exports = router;
