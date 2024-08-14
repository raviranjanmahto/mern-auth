const router = require("express").Router();
const authController = require("../controllers/authController");

// Public routes for user authentication and management
router.post("/signup", authController.signup); // Route to handle user signup
router.post("/login", authController.login); // Route to handle user login
router.post("/forgot-password", authController.forgotPassword); // Route to handle forgot password request
router.post("/reset-password/:token", authController.resetPassword); // Route to handle password reset using a token
router.get("/verify-token", authController.protect); // Route to verify access token

// Middleware to protect routes that require authentication
router.use(authController.protect);

router.get("/current-user", authController.currentUser);
router.patch("/update-user", authController.updateUser);
router.post("/logout", authController.logout); // Route to handle user logout
router.post("/verify-email", authController.verifyEmail); // Route to verify user email address using a token

module.exports = router;
