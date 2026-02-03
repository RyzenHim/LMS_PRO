const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth.middleware");
const courseCtrl = require("../controllers/course.controller");

router.get("/all", courseCtrl.allCourses);
router.get("/trash/list", courseCtrl.getDeletedCourses);
router.get("/:id", courseCtrl.getCourseById);
router.post("/add", courseCtrl.addCourse);
router.put("/:id", courseCtrl.updateCourse);
router.patch("/:id/toggle-status", courseCtrl.toggleCourseStatus);
router.delete("/:id", courseCtrl.softDeleteCourse);
router.patch("/:id/restore", courseCtrl.restoreCourse);

module.exports = router;

