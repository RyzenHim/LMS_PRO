const router = require("express").Router()
// const router = express.Router()
const authenticate = require("../middleware/auth.middleware");
// const role = require("../middlewares/role.middleware");

const {
    createVisitor,
    getVisitors,
    getVisitorById,
    updateVisitor,
    softDeleteVisitor,
    restoreVisitor,
    getDeletedVisitors,
    convertToStudent,
} = require("../controllers/visitor.controller");

// router.use(auth, role(["admin"]));
// router.use(authenticate)

router.post("/add", createVisitor);
router.get("/allvisitor", getVisitors);
router.get("/trash/list", getDeletedVisitors);
router.get("/:id", getVisitorById);
router.put("/:id", updateVisitor);
router.delete("/:id", softDeleteVisitor);
router.patch("/:id/restore", restoreVisitor);
router.post("/:id/convert", convertToStudent);


module.exports = router;
