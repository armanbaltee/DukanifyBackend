const express = require("express");
const router = express.Router();
const otpCotroller = require("../../controller/auth/signup-auth/otp.controller");
const signupController = require("../../controller/auth/signup-auth/signupAuth.controller");
const signupMiddleware = require("../../middleware/auth/signup-auth-middleware/signupAuth.middleware")
const googleAuth = require("../../controller/auth/signup-auth/google.controller")

// import login...

const loginController = require("../../controller/auth/login-auth/forgotAndResetPass");
const loginAuthController = require("../../controller/auth/login-auth/user.controller")
const loginAuthMiddleware = require("../../middleware/auth/login-auth-middleware/user.middleware")
const verifyLoginOtp = require("../../controller/auth/login-auth/verifyLoginOTP.controller")

router.post('/signup', signupMiddleware.signupMiddleware ,signupController.signup)
router.post('/verifyotp', otpCotroller.verifyOTP);
router.post('/resendotp', otpCotroller.resendOTP);
router.post('/google', googleAuth.googleLogin)

// login start

router.post('/forgot-password', loginController.forgotPassword);
router.post('/reset-password', loginController.resetPassword);
router.post('/login', loginAuthMiddleware.login, loginAuthController.login);
router.post('/verifyOTP', verifyLoginOtp.verifyOTP);
router.post('/resendOTP', verifyLoginOtp.resendOTP)

module.exports =router