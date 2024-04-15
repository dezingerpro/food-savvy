const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  iname: {
    type: String,
    required: true,
  },
  iimage: {
    type: String,
    required: true,
  },
  istock: {
    type: Number,
    required: true,
  },
  iprice: {
    type: Number,
    required: true,
  },
  quantityType: {
    type: String,
    required: true,
    enum: ['Liters', 'Milliliters', 'Grams', 'Kilograms', 'Tablespoons', 'Cups', 'Pieces', 'Others'],
    default: 'Pieces', // Optional: set a default value if applicable
  },
});

const IngredientModel = mongoose.model('Ingredient', ingredientSchema);
module.exports = IngredientModel;
