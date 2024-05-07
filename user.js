const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    'id':{
        type: mongoose.Schema.Types.ObjectId,
    },
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
    'uorder': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    'lastViewedRecipes': [ 
        { 
            type: String, maxItems: 10
        }
    ],
    'ucart': [ 
        {
            id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'IngredientModel' }, // Assuming 'id' references another collection
          'ingredientName': String,
          'quantity': Number,
          _id: false
        }
    ],
    'uratings': [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating'
    }],
    'allergies': [{ // New field for allergies
        type: String
    }],
    'savedRecipes': [{ // New field for saved recipe IDs
        type: mongoose.Schema.Types.ObjectId, // Assuming recipes are stored in another collection
        ref: 'Recipes'
    }]
});

const User = mongoose.model("User", userSchema);
module.exports = User;
