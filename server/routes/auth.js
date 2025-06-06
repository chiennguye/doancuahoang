const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/login-with-google", authController.loginWithGoogle);
router.post("/login-with-facebook", authController.loginWithFacebook);
router.post("/login-bookstore", authController.loginBookStore);
router.post("/forgot-password", authController.handleForgotPassword);
router.post("/reset-password", authController.handleResetPassword);
router.post("/refresh-token", authController.handleRefreshToken);
router.post("/logout", authController.handleLogout);

// Remove or fix the problematic GET route that's causing the error
// router.get("/something", authController.someUndefinedMethod);

// Protected routes
router.get("/current-user", verifyToken, authController.getCurrentUser);

module.exports = router;
