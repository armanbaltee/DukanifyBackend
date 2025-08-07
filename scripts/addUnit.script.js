const Unit = require("../models/product/unit.model");

const singleUnitAdd = async (req, res)=>{
    try {
        const { name } = req.body;
        if(!name){
            return res.status(500).json({message: "Name must required"})
        }
        const existCategory = await Unit.findOne({ name });
        if(existCategory){
            return res.status(500).json({message: "Unit already exist"});
        }
        const category = new Unit({name});
        await category.save();
        res.status(200).json({message: "Category added", name: category});
    } catch (error) {
        return res.status(500).json({message: "server error:", err: error.me})
    }
}

const multipleUnits = async (req, res)=>{
    try {
        const { units } = req.body;
        if(!Array.isArray(units) || units.length === 0){
            return res.status(500).json({message: "Units empty"});
        }
        const uniqueName = [...new Set(units)];
        const data = uniqueName.map(name=> ({ name }));
        const result = await Unit.insertMany(data, { ordered: false});
        res.status(200).json({message: "Successfully add unit", data: result})
    } catch (error) {
        return res.status(500).json({message: "Server Error:", err: error.message})
    }
}

const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ name: 1 });
    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchUnits = async (req, res)=>{
    try {
    const query = req.query.query || '';
    // if (query.length < 3) {
    //   return res.status(400).json({ message: 'Enter at least 3 characters' });
    // }

    const units = await Unit.find({
      name: { $regex: query, $options: 'i' }
    });

    res.json(units);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



module.exports = {
    singleUnitAdd,
    multipleUnits,
    getAllUnits,
    searchUnits
}