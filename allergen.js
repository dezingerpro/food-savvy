const mongoose = require("mongoose");

const allergenSchema = new mongoose.Schema(
    {
    allergen: String, // Name of the allergen
    ingredients: [String] // Ingredients containing the allergen
});

const Allergen = mongoose.model('Allergen', allergenSchema, 'allergen');
module.exports = Allergen;
