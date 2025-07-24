const User = require('../../../models/auth/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config()


exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Account verified successfully',token });
  } catch (error) {
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await sendOTP(user.email, otp);

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

