const Admin = require("../../models/admin/admin.model");
const Store = require("../../models/store.model")
const socket = require('../../utils/socket.order');

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

const getAllStore = async (req, res) => {
  try {
    const pendingListStore = await Store.find()
      .populate('userId', 'name');

    if (!pendingListStore || pendingListStore.length === 0) {
      return res.status(404).json({ message: "No stores found!" });
    }

    const storeList = pendingListStore.map(store => ({
      id: store._id,
      logo: store.storeLogo,
      storeName: store.storeName,
      ownerName: store.userId?.name || "N/A",
      isStoreVerified: store.isStoreVerified
    }));

    res.status(200).json({ message: "Store List", data: storeList });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", err: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const storeId = req.params.storeId;

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { isStoreVerified: true },
      { new: true }
    );

    if (!updatedStore) {
      return res.status(404).json({ message: "No store request found" });
    }

    socket.emitToStore(storeId, 'store:verified', {
      storeId: updatedStore._id,
      storeName: updatedStore.storeName,
      isStoreVerified: true
    });

    res.status(200).json({ message: "Store accepted successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", err: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const storeId = req.params.storeId;

    const deletedStore = await Store.findByIdAndDelete(storeId);

    if (!deletedStore) {
      return res.status(404).json({ message: "Store not found or already deleted" });
    }

    socket.emitToStore(storeId, "store:rejected", {
  storeId: deletedStore._id,
  storeName: deletedStore.storeName,
  isStoreVerified: false
});


    res.status(200).json({ message: "Store rejected and deleted successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Server Error", err: error.message });
  }
};

module.exports = {
    login,
    getAllStore,
    acceptRequest,
    rejectRequest
}