const User = require('../../../models/auth/user.model');
const jwt = require('jsonwebtoken');
const service = require('../../../service/userService')
require('dotenv').config()


exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    console.log('userId--->', userId)
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
      { expiresIn: '2h' }
    );

    res.json({ message: 'Account verified successfully',token });
  } catch (error) {
    console.log('error:', error.message)
    res.status(500).json({message: "Error: ", err: error.message})
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = service.generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await service.sendOTP(user.email, otp);

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.log('error:', error.message)
    res.status(500).json({message: "Error: ", err: error.message})
    // next(error);
  }
};

