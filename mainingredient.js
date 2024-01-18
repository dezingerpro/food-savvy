const mongoose = require("mongoose");

// Define the main recipe schema using the ingredientSchema
let mainIngSchema = new mongoose.Schema({
    mname: {
        type: String,
        required: true
    },
    mimage: {
        type: String, 
        required: true
    }

});

const main_Ingredients = mongoose.model("main_ingredients", mainIngSchema);
module.exports = main_Ingredients;
