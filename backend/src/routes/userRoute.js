const express = require("express");
const router = express.Router();

const userController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", authenticate, userController.logout);

router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

router.get("/me", authenticate, userController.getCurrentUser);
router.patch("/profile", authenticate, userController.updateProfile);
console.log("Inside userRoute.js ✅");

module.exports = router;
