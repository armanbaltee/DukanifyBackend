const User = require('../../../models/auth/user.model');
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  generateToken
} = require('../../../service/forgotAndResetServices');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    const otp = generateLoginOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 2 * 60 * 1000;
    await user.save();

    try {
      await sendOTPEmail(email, otp);
      return res.status(200).json({ message: 'OTP sent to your email', token : user.otp, userId : user._id });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { id, newPassword } = req.body;

  try {
    const hashed = await hashPassword(newPassword);
    await User.findOneAndUpdate({ id }, { password: hashed });
    
    const user = await User.findOne({ _id: id });
    console.log("hased--->", id)
    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Password reset successfully',
      token: token,
    });

  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired' });
  }
};


const generateLoginOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
