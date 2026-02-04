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
    getNotInterestedVisitors,
    getFollowUpVisitors,
    getConvertedVisitors,
    markNotInterested,
    convertToStudent,
    convertToTutor,
    convertToEmployee,
} = require("../controllers/visitor.controller");

// router.use(auth, role(["admin"]));
// router.use(authenticate)

router.post("/add", createVisitor);
router.get("/allvisitor", getVisitors);
router.get("/trash/list", getDeletedVisitors);
router.get("/not-interested/list", getNotInterestedVisitors);
router.get("/follow-up/list", getFollowUpVisitors);
router.get("/converted/list", getConvertedVisitors);
router.get("/:id", getVisitorById);
router.put("/:id", updateVisitor);
router.delete("/:id", softDeleteVisitor);
router.patch("/:id/restore", restoreVisitor);
router.patch("/:id/not-interested", markNotInterested);
router.post("/:id/convert/student", convertToStudent);
router.post("/:id/convert/tutor", convertToTutor);
router.post("/:id/convert/employee", convertToEmployee);


module.exports = router;
