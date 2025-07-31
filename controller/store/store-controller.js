// controllers/storeController.js
const Store = require('../../models/store.model');

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


exports.createStore = async (req, res) => {
    try {
      const {
        userId,
        storeName,
        storeAddress,
        storePhone,
        storeDescription,
        openingTime,
        closingTime,
        storePaymentMethods,
      } = req.body;

      

      

      const newStore = new Store({
        userId,
        storeName,
        storeAddress,
        storePhone,
        storeDescription,
        storeTiming: {
          openingTime,
          closingTime,
        },
        storePaymentMethods: JSON.parse(storePaymentMethods),

        storeLogo: req.files['storeLogo']?.[0]?.path || '',
        storeBanner: req.files['storeBanner']?.map(file => file.path) || [],
        storePictures: req.files['storePictures']?.map(file => file.path) || [],
      });

      console.log('new store=====', newStore)

      await newStore.save();
      res.status(201).json({ message: 'Store created', store: newStore });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating store', error });
    }
  }


  exports.getStore = async (req, res) => {
    const userId = req.params.id
    console.log('userid==========', userId)
    try{
      const stores = await Store.find({ userId })

      if(!stores){
        return res.status(400).send({ message : 'Store Not Found!' })
      }

      res.status(200).send(stores)
    }catch(error){
      console.log('Error in finding store', error)
      res.status(400).send({ message : 'Store finding Error!!' })
    }
  }

  exports.getStoreById = async (req, res) => {
    const userId = req.params.id

    console.log('storeid===========', userId)

    try{
      const store = await Store.findOne({ userId })

      if(!store){
        return res.status(400).send({ message : 'Store not found' })
      }
      
      res.status(200).send(store)

    }catch(error){
      console.log('Error in finding store', error)
      res.status(400).send({ message : 'Store finding Error!!' })
    }
  }



  exports.getAllStoreNames = async (req, res) => {
    try{
      const storeNames = await Store.find().select('storeName userId')

      if(!storeNames) return res.status(400).send({ message : 'No store found!' })

      res.status(200).send(storeNames)
      
    }catch(error){
      console.log('Error in finding Store Names')
      res.status(400).send({ message : 'Error in finding StoreNames' })
  }
  }
