const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming 'User' is your user model name
    },
    orderTotal:{
        type:String
    },
    paidStatus:{
        type:String
    },
    items: [{
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        default: 'Pending' // Orders start with a 'Pending' status
      }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
