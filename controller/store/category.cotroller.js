const Category = require("../../models/store/category.model");

const singleCategoryAdd = async (req, res)=>{
    try {
        const { name } = req.body;
        if(!name){
            return res.status(500).json({message: "Name must required"})
        }
        const existCategory = await Category
    } catch (error) {
        return res.status(500).json({message: "server error:", err: error.me})
    }
}