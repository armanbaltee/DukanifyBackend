const User = require('/models/auth/user.model');
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  generateToken
} = require('/service/forgotAndResetServices');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 2 * 60 * 1000;
    await user.save();

    try {
      await sendOTPEmail(email, otp);
      return res.status(200).json({ message: 'OTP sent to your email' });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const hashed = await hashPassword(newPassword);
    await User.findOneAndUpdate({ email }, { password: hashed });

    const user = await User.findOne({ email });
    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Password reset successfully',
      token: token,
    });

  } catch (err) {
    return res.status(400).json({ message: 'Invalid or expired' });
  }
};
