const User = require("../../../models/auth/user.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");




const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found");
      return res.status(400).send({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log('match pass ======', isMatch)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id, role : user.role }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    res.status(200).json({
      message: "Login Successfll",
      token,
      user: {
        password: user.password,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).send(error.message || "Something went wrong");
  }
};

module.exports = {
  login
};
