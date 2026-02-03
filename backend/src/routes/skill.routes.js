const router = require("express").Router();
const skillCtrl = require("../controllers/skill.controller");

router.get("/all", skillCtrl.allSkills);
router.get("/trash/list", skillCtrl.getDeletedSkills);
router.get("/:id", skillCtrl.getSkillById);
router.post("/add", skillCtrl.addSkill);
router.put("/:id", skillCtrl.updateSkill);
router.patch("/:id/toggle-status", skillCtrl.toggleSkillStatus);
router.delete("/:id", skillCtrl.softDeleteSkill);
router.patch("/:id/restore", skillCtrl.restoreSkill);

module.exports = router;
