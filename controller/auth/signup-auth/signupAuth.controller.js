const bcrypt = require('bcrypt');
const User = require("../../../models/auth/user.model");
const { generateOTP, sendOTP } = require("../../../service/userService");

const signup = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // ✅ 1. Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ 2. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // ✅ 3. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    // ✅ 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 5. Generate OTP
    const otp = generateOTP();

    // ✅ 6. Save new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins expiry
    });

    await user.save();

    // ✅ 7. Send OTP via email
    await sendOTP(email, otp);

    // ✅ 8. Respond to frontend
    res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      userId: user._id
    });

  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

module.exports = { signup };
