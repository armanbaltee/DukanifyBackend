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
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

const mailOptions = {
  from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USERNAME}>`,
  to: email,
  subject: 'Reset Your Password - OTP Inside',
  html: `
    <div style="background-color: #FCF9F6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; padding: 35px 40px; box-shadow: 0 12px 30px rgba(72, 66, 63, 0.15);">
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A8765F; margin-bottom: 8px; font-size: 26px; letter-spacing: 1px;">Reset Password</h1>
          <p style="color: #7B8D8E; font-size: 14px;">Secure your account with the OTP below</p>
        </div>

        <p style="color: #4A423F; font-size: 16px; line-height: 1.6;">
          Hi there,
          <br><br>
          You recently requested to reset your password for <strong>${process.env.APP_NAME}</strong>. Please use the one-time password (OTP) below to proceed. This OTP is only valid for <strong>2 minutes</strong>.
        </p>

        <div style="text-align: center; margin: 35px 0;">
          <div style="
            display: inline-block;
            background-color: #D4A373;
            color: #FFFFFF;
            padding: 16px 36px;
            font-size: 24px;
            font-weight: bold;
            border-radius: 10px;
            letter-spacing: 4px;
            box-shadow: 0 6px 18px rgba(212, 163, 115, 0.5);
          ">
            ${otp}
          </div>
        </div>

        <p style="color: #4A423F; font-size: 16px; line-height: 1.6;">
          If you didn’t request a password reset, please ignore this message or contact our support if you’re concerned.
        </p>

        <p style="color: #7B8D8E; margin-top: 40px; font-size: 14px;">
          Regards,<br>
          <strong>The ${process.env.APP_NAME} Team</strong>
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #7B8D8E;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </div>
    </div>
  `
};



  await transporter.sendMail(mailOptions);
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: '2h' });
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  generateToken
};
