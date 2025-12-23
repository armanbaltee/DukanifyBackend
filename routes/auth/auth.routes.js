const express = require("express");
const router = express.Router();

// --------------------
// Import Controllers
// --------------------
// Signup & Auth Controllers
const otpCotroller = require("../../controller/auth/signup-auth/otp.controller");
const signupController = require("../../controller/auth/signup-auth/signupAuth.controller");
const googleAuth = require("../../controller/auth/signup-auth/google.controller");

// Login & Password Controllers
const loginController = require("../../controller/auth/login-auth/forgotAndResetPass");
const loginAuthController = require("../../controller/auth/login-auth/user.controller");
const verifyLoginOtp = require("../../controller/auth/login-auth/verifyLoginOTP.controller");

// --------------------
// Import Middlewares
// --------------------
const signupMiddleware = require("../../middleware/auth/signup-auth-middleware/signupAuth.middleware");
const loginAuthMiddleware = require("../../middleware/auth/login-auth-middleware/user.middleware");

// --------------------
// Signup Routes
// --------------------

// Register a new user
// Uses signupMiddleware to validate input before processing
router.post('/signup', signupMiddleware.signupMiddleware, signupController.signup);

// Verify the OTP sent to email during signup
router.post('/verifyotp', otpCotroller.verifyOTP);

// Resend the signup OTP
router.post('/resendotp', otpCotroller.resendOTP);

// Google OAuth Login
router.post('/google', googleAuth.googleLogin);

// --------------------
// Login Routes
// --------------------
// Handle "Forgot Password" request
router.post('/forgot-password', loginController.forgotPassword);

// Handle "Reset Password" with token/OTP
router.post('/reset-password', loginController.resetPassword);

// User Login Route
// Uses loginAuthMiddleware to validate credentials/status
router.post('/login', loginAuthMiddleware.login, loginAuthController.login);

// Verify OTP for Login (Two-Factor Auth)
router.post('/verifyloginOTP', verifyLoginOtp.verifyOTP);

// Resend OTP for Login
router.post('/resendloginOTP', verifyLoginOtp.resendOTP);

module.exports = router;