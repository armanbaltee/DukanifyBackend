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
  from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Password Reset OTP',
  html: `
    <div style="background-color: #FCF9F6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; padding: 0; box-shadow: 0 12px 30px rgba(72, 66, 63, 0.15); overflow: hidden;">
        
        <!-- Banner Image -->
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dyaydsevo/image/upload/v1753884649/Black_and_Red_Online_Store_Logo_1_tykzlu.png" alt="App Logo" style="width: 100%; max-height: 150px; object-fit: cover;" />
        </div>

        <!-- Content -->
        <div style="padding: 35px 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #A8765F; margin-bottom: 8px; font-size: 26px; letter-spacing: 1px;">Password Reset</h1>
            <p style="color: #7B8D8E; font-size: 14px;">Use the OTP below to continue</p>
          </div>

          <p style="color: #4A423F; font-size: 16px; line-height: 1.6;">
            Hello from <strong>${process.env.APP_NAME}</strong>,<br><br>
            Your OTP for password reset is:
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
            This OTP is valid for <strong>2 minutes</strong>. Please do not share it with anyone.
          </p>

          <p style="color: #7B8D8E; margin-top: 40px; font-size: 14px;">
            If you did not request this password reset, you can safely ignore this email.
          </p>

          <p style="color: #4A423F; font-size: 14px;">
            Thank you,<br>
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