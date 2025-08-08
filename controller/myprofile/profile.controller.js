const User = require('../../models/auth/user.model');
const Store = require('../../models/store.model')

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('name email photo role');
    const storeStatus = await Store.findOne({ userId : userId }).select('isStoreVerified')
    console.log("user========>", user, storeStatus)

    

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).send([user, storeStatus]);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE USER BY ID
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name } = req.body;
    console.log('REQ BODY:', req.body);
console.log('REQ FILE:', req.file);

    const updateData = { name };

    if (req.file && req.file.path) {
      updateData.photo = req.file.path; // Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('name email photo');
    console.log("REQ BODY:", req.body);
console.log("REQ FILE:", req.file);

    res.status(200).json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
  console.error("Update profile error:", error);
res.status(500).json({
  success: false,
  message: 'Internal server error',
  error: error.message || error.toString(),
});
}
};

