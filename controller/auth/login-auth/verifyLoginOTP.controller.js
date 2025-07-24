const User = require('../../../models/auth/user.model');
const nodemailer = require("nodemailer")
require('dotenv').config()

exports.verifyOTP = async (req, res, next) => {
  try {
    const { id, otp } = req.body;

    console.log('verify OTP=====', req.body)

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    console.log('error in otp verify', error)
    res.send({ message : 'error in verify otp' })
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;

    console.log('resend OTP====', userId)

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateLoginOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp)

    res.json({ message: 'New OTP sent to your email',token: user.otp });
  } catch (error) {
    console.log('error in otp resend', error)
    res.send({ message : 'error in resend otp' })
  }
};



const generateLoginOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};


const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `"APP_NAME" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <h2>Hello from YourApp!</h2>
      <p>Your OTP for password reset is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 2 minutes.</p>
      <br>
      <small>If you did not request this, please ignore this email.</small>
    `
  };

  await transporter.sendMail(mailOptions);
};