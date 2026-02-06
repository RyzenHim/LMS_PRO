const express = require("express");
const router = express.Router();

const feesController = require("../controllers/fees.controller");

router.get("/all", feesController.allFees);
router.get("/trash/list", feesController.getDeletedFees);
router.get("/:id", feesController.getFeesById);

router.post("/add", feesController.addFees);
router.put("/:id", feesController.updateFees);

router.patch("/:id/toggle-status", feesController.toggleFeesStatus);

router.delete("/:id", feesController.softDeleteFees);
router.patch("/:id/restore", feesController.restoreFees);

module.exports = router;
