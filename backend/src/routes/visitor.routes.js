const router = require("express").Router();
// const auth = require("../middlewares/auth.middleware");
// const role = require("../middlewares/role.middleware");

const {
    createVisitor,
    getVisitors,
    getVisitorById,
    updateVisitor,
    softDeleteVisitor,
    restoreVisitor,
    getDeletedVisitors,
} = require("../controllers/visitor.controller");

// router.use(auth, role(["admin"]));

router.post("/add", createVisitor);
router.get("/", getVisitors);
router.get("/trash/list", getDeletedVisitors);
router.get("/:id", getVisitorById);
router.put("/:id", updateVisitor);
router.delete("/:id", softDeleteVisitor);
router.patch("/:id/restore", restoreVisitor);

module.exports = router;
