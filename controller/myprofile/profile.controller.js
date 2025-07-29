const User = require('../../models/auth/user.model');
const fs = require('fs');
const path = require('path');


// GET USER BY ID

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only fetch specific fields for security
    const user = await User.findById(userId).select('name email photo');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE USER BY ID (name + optional photo)

exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name } = req.body;

    const updateData = { name };

    if (req.file) {
      updateData.photo = req.file.filename;

      // Remove old photo if exists
      const user = await User.findById(userId);
      if (user?.photo && fs.existsSync(`uploads/${user.photo}`)) {
        fs.unlinkSync(`uploads/${user.photo}`);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('name email photo');

    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
