const bcrypt = require('bcrypt');
const User = require('../../../models/auth/user.model');
const {
  generateOTP,
  sendOTPEmail,
  hashPassword,
  generateToken
} = require('../../../service/forgotAndResetServices');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log('email in forget password====', req.body)

  try {
    const user = await User.findOne({ email });

    console.log('user found in forget==', user)
    if (!user) {
      return res.status(404).json({ message: 'Email not registered' });
    }

    const otp = generateLoginOTP();
    user.otp = otp;

    console.log('otp', user.otp)
    user.otpExpires = Date.now() + 2 * 60 * 1000;
    await user.save();

    console.log('user--------------', user)

    
    await sendOTPEmail(email, otp);
    return res.status(200).json({ message: 'OTP sent to your email', token : user.otp, userId : user._id });
    

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

exports.changePassword = async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
console.log('Received body:======', req.body);
  try {
    const user = await User.findById(id);

    console.log('user for change', user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json('Incorrect old password');
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);

    // Update password
    await User.findByIdAndUpdate(id, { password: hashed });

    const token = generateToken(user._id); // Optional: issue new token

    return res.status(200).json({
      message: 'Password changed successfully',
      token: token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};