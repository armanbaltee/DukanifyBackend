const Admin = require("../../models/admin/admin.model");
const Store = require("../../models/store.model")

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: 'Login successful', token: admin._id });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error:", err: error.message });
  }
};

const getPendingList = async (req, res) => {
  try {
    const pendingListStore = await Store.find({ isStoreVerified: false })
      .populate('userId', 'name');

    if (!pendingListStore || pendingListStore.length === 0) {
      return res.status(404).json({ message: "No pending stores found!" });
    }

    const storeList = pendingListStore.map(store => ({
      logo: store.storeLogo,
      storeName: store.storeName,
      ownerName: store.userId?.name || "N/A",
    }));

    res.status(200).json({ message: "Pending List", data: storeList });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", err: error.message });
  }
};



module.exports = {
    login,
    getPendingList
}