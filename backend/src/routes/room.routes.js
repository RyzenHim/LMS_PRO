const router = require("express").Router();

const roomCtrl = require("../controllers/room.controller");
const authenticate = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");

router.get("/all", authenticate, allowRoles("admin", "hr"), roomCtrl.getAllRoomSetups);
router.get("/options", authenticate, allowRoles("admin", "hr"), roomCtrl.getRoomOptions);
router.post("/", authenticate, allowRoles("admin", "hr"), roomCtrl.createRoomSetup);
router.put("/:id", authenticate, allowRoles("admin", "hr"), roomCtrl.updateRoomSetup);
router.delete("/:id", authenticate, allowRoles("admin", "hr"), roomCtrl.deleteRoomSetup);

module.exports = router;
