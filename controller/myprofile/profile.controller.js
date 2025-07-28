const User = require('../../models/auth/user.model');

// Get user by ID (for frontend header display)
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
