const Product = require("../../models/product/product.model")

exports.bulkUpateProduct = async (req, res)=>{
    try {
        const products = await Product.find();
        
        let bulkOp = [];
        for(product of products){
            if(product.stock==0){
                bulkOp.push({
                    deleteOne: {
                        filter: { _id: product._id}
                    }
                });
            }else{
                const updatedPrice = product.price + (product.price * 0.10);
                
                bulkOp.push({
                    updateOne: {
                        filter: {_id: products._id},
                        update: { $set: { price: updatedPrice}}
                    }
                });
            }
        }
        if(bulkOp.length > 0){
            const result = await Product.bulkWrite(bulkOp);
            
            return res.status(200).json( {message: 'Bulk update successful',result} );
        }else{
             return res.status(200).json({ message: 'No operations performed. Nothing to update or delete.'});
        }
    } catch (error) {
        console.error('Bulk update error:', error);
        return res.status(500).json({message: "Server Error:", err: error.message});
    }
}

