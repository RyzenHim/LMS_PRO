const express = require("express");
const router = express.Router();

const {
    getStudentsOfBatch,
    getBatchesOfStudent,
    addStudentsToBatch,
    removeStudentsFromBatch,
    changeStudentBatch,
    allBatches
} = require("../controllers/batchStudentMap.controller");

router.get("/all", allBatches)
router.get("/batch/:batchId/students", getStudentsOfBatch);
router.put("/batch/:batchId/add-students", addStudentsToBatch);
router.put("/batch/:batchId/remove-students", removeStudentsFromBatch);

router.get("/student/:studentId/batches", getBatchesOfStudent);
router.post("/student/:studentId/change-batch", changeStudentBatch);

module.exports = router;
