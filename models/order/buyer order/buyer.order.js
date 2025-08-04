const mongoose = require('mongoose');

const buyerOrderSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderDetails: [
        {
            storeID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Store',
                required: true
            },
            products: [{
                productID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                totalPrice: {
                    type: Number,
                    required: true
                }
            }]
        }
    ],
    isOrderConfirmed: {
        type: Boolean,
        default: false
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Accept", "Reject", "Packed", "Fullfilled", 'Cancel'],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('BuyerOrder', buyerOrderSchema);
