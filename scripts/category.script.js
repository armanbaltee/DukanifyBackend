const Category = require("../models/product/category.model");

const singleCategoryAdd = async (req, res)=>{
    try {
        const { name } = req.body;
        if(!name){
            return res.status(500).json({message: "Name must required"})
        }
        const existCategory = await Category.findOne({ name });
        if(existCategory){
            return res.status(500).json({message: "Category already exist"});
        }
        const category = new Category({name});
        await category.save();
        res.status(200).json({message: "Category added", name: category});
    } catch (error) {
        return res.status(500).json({message: "server error:", err: error.me})
    }
}

const multipleCategory = async (req, res)=>{
    try {
        const { categories } = req.body;
        if(!Array.isArray(categories) || categories.length === 0){
            return res.status(500).json({message: "Categories empty"});
        }
        const uniqueName = [...new Set(categories)];
        const data = uniqueName.map(name=> ({ name }));
        const result = await Category.insertMany(data, { ordered: false});
        res.status(200).json({message: "Successfully add categories", data: result})
    } catch (error) {
        return res.status(500).json({message: "Server Error:", err: error.message})
    }
}

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchCategory = async (req, res)=>{
    try {
    const query = req.query.query || '';
    // if (query.length < 3) {
    //   return res.status(400).json({ message: 'Enter at least 3 characters' });
    // }

    const categories = await Category.find({
      name: { $regex: query, $options: 'i' }
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



module.exports = {
    singleCategoryAdd,
    multipleCategory,
    getAllCategories,
    searchCategory
}