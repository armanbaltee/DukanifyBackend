  const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
 
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  
  googleId: {
    type: String,
    unique: true,
    sparse: true   
  },

  // For Email/Password Login
  password: {
    type: String
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Optional photo field (for Google or profile image)
  photo: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}); 
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};


module.exports = mongoose.model('User', userSchema);