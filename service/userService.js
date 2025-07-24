const nodemailer = require('nodemailer');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your OTP for Account Verification',
    html: `&lt;p&gt;Your OTP is: &lt;strong&gt;${otp}&lt;/strong&gt;&lt;/p&gt;`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { 
    generateOTP, 
    sendOTP 
};