// controllers/storeController.js
const Store = require('../../models/store.model');
const Product = require('../../models/product/product.model');


exports.searchEcommerce = async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 3) {
    return res.status(400).json({ message: 'Minimum 3 characters required' });
  }

  try {

    const matchedStores = await Store.find({
      storeName: { $regex: query, $options: 'i' },
      isStoreVerified: true
    }).select('_id storeName storeLogo storeTiming');


    const matchedProducts = await Product.find({
      name: { $regex: query, $options: 'i' },
      // stock: { $gt: 0 },
      // isActive: true
    }).populate({
      path: 'storeId',
      match: { isStoreVerified: true },
      select: '_id storeName storeLogo storeTiming'
    });

    const filteredProducts = matchedProducts.filter(p => p.storeId !== null);

    res.status(200).json({
      stores: matchedStores,
      products: filteredProducts
    });

  } catch (error) {
    console.error('Search Error:', error);
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
    const storeId = req.params.id

    console.log('storeid===========', storeId)

    try{
      const store = await Store.findById(storeId)

      if(!store){
        return res.status(400).send({ message : 'Store not found' })
      }
      
      res.status(200).send(store)

    }catch(error){
      console.log('Error in finding store', error)
      res.status(400).send({ message : 'Store finding Error!!' })
    }
  }
