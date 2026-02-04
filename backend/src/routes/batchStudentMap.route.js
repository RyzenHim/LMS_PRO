const express = require("express");
const router = express.Router();

const {
    getStudentsOfBatch,
    getBatchesOfStudent,
    addStudentsToBatch,
    removeStudentsFromBatch,
} = require("../controllers/batchStudentMap.controller");

router.get("/batch/:batchId/students", getStudentsOfBatch);
router.put("/batch/:batchId/add-students", addStudentsToBatch);
router.put("/batch/:batchId/remove-students", removeStudentsFromBatch);

router.get("/student/:studentId/batches", getBatchesOfStudent);

module.exports = router;
