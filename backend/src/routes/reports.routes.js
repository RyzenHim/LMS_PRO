const router = require("express").Router();
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");
const reportCtrl = require("../controllers/report.controller");

router.get("/students", authenticate, allowRoles("admin"), reportCtrl.studentReport);

module.exports = router;
