const mongoose = require("mongoose");

// Define a schema for the ingredients
const ingredientSchema = new mongoose.Schema({
    ingredientName: String,
    quantity: String,
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
    }
});

const Recipes = mongoose.model("recipes", recipeSchema);
module.exports = Recipes;
