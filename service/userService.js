const nodemailer = require('nodemailer');
require("dotenv").config();


const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 9000).toString();
};

const sendOTP = async (email, otp) => {
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
  subject: 'Your OTP for Account Verification',
  html: `
    <div style="background-color: #FCF9F6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 30px rgba(72, 66, 63, 0.15);">
        
        <!-- Banner -->
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dyaydsevo/image/upload/v1753884649/Black_and_Red_Online_Store_Logo_1_tykzlu.png" 
               alt="Banner" style="width: 100%; height: auto; max-height: 150px; object-fit: cover;" />
        </div>

        <!-- Body -->
        <div style="padding: 30px 40px;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #A8765F; margin-bottom: 8px; font-size: 24px; letter-spacing: 1px;">Verify Your Account</h1>
            <p style="color: #7B8D8E; font-size: 14px;">Use the code below to complete your verification</p>
          </div>

          <p style="color: #4A423F; font-size: 16px; line-height: 1.6;">
            Hello,<br><br>
            Thank you for registering with <strong>${process.env.APP_NAME}</strong>. Please use the following OTP to verify your account:
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
            This OTP is valid for <strong>2 minutes</strong>. Do not share it with anyone.
          </p>

          <p style="color: #7B8D8E; margin-top: 40px; font-size: 14px;">
            If you did not initiate this request, please ignore this email.
          </p>

          <p style="color: #4A423F; font-size: 14px;">
            Thanks,<br>
            <strong>The ${process.env.APP_NAME} Team</strong>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #7B8D8E;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </div>
    </div>
  `
};


  await transporter.sendMail(mailOptions);
};

module.exports = { 
    generateOTP, 
    sendOTP 
};