const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
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

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  generateToken
};
