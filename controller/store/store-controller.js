// controllers/storeController.js
const Store = require('/models/store.model');

exports.searchStores = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({ message: 'Minimum 3 characters required' });
  }

  try {
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false }); // "14:32:00"

    const stores = await Store.find({
      storeName: { $regex: query, $options: 'i' }
    })
      .select('storeName storeLogo storeTiming')
      .limit(4)
      .lean(); // lean() so we can modify the results

    // Add status field to each store
    const updatedStores = stores.map(store => {
      const { openingTime, closingTime } = store.storeTiming;
      const isOpen = currentTime >= openingTime && currentTime <= closingTime;
      return {
        ...store,
        status: isOpen ? 'Open' : 'Closed'
      };
    });

    res.status(200).json(updatedStores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
