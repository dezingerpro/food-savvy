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
});

const IngredientModel = mongoose.model('Ingredient', ingredientSchema);
module.exports = IngredientModel;
