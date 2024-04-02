const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    'uname': {
        required: true,
        type: String
    },
    'uemail': {
        required: true,
        type: String
    },
    'upass': {
        required: true,
        type: String
    },
    'umobile': { // New field for mobile number
        type: String,
        required: true
    },
    'ucity': { // New field for city
        type: String,
    },
    'ustreet': { // New field for street address
        type: String,
    },
    'uhouse': { // New field for house details
        type: String,
    },
    'usecurityQuestion': {
        type: String,
        required: true
    },
    'uanswer': {
        type: String,
        required: true
    },
    'isAdmin': {
        type: Boolean,
        required: true
    },
    uorder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    lastViewedRecipes: [ // Assuming this remains unchanged
        { 
            type: String, maxItems: 5
        }
    ],
    ucart: [ // Assuming this remains unchanged
        {
          ingredientName: String,
          quantity: Number
        }
    ]
});

const User = mongoose.model("user", userSchema);
module.exports = User;
