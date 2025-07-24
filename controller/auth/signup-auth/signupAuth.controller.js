const User = require("../../../models/auth/user.model");
const { generateOTP, sendOTP } = require("../../../service/userService");

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const otp = generateOTP();
    const user = new User({
      email,
      password,
      otp,
      otpExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    await user.save();
    await sendOTP(email, otp);

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

const protectedRoute = (req, res) => {
  res.status(200).json({ message: "Protected content accessed" });
};

module.exports = {
  signup,
  protectedRoute,
};
