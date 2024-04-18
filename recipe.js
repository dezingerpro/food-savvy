const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
    ingredientName: {
        type: String,
        required: true,  // Assuming ingredient name is required
        default: 'Unknown'
    },
    quantity: {
        type: String,
        default: '0'
    },
    qtytype: {
        type: String,
        default: 'units'  // Provide a default measurement unit
    },
    extra: {
        type: String,
        default: ''       // Allow for additional details with a safe default
    },
    secondaryName: {
        type: String,
        default: ''       // Handle secondary names or alternative identifiers
    }
}, {
    timestamps: true  // Optional: Adds createdAt and updatedAt timestamps
});

// Define the main recipe schema using the ingredientSchema
let recipeSchema = new mongoose.Schema({
    rname: {
        required: true,
        type: String
    },
    rmainingredient: {
        required: true,
        type: String
    },
    ringredients: [ingredientSchema], // Use the ingredientSchema for ringredients
    rratings: {
        required: true,
        type: Number
    },
    rimage: {
        required: true,
        type: String
    },
    rlink: {
        required: true,
        type: String
    },
    rtype: {
        required: true,
        type: String
    },
    allergens: [String]
});

const Recipes = mongoose.model("recipes", recipeSchema);
module.exports = Recipes;
