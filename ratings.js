const mongoose = require('mongoose');

const recipeRatingSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Recipes' // Assuming 'Recipe' is your Recipe model
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Assuming 'User' is your User model
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Minimum rating value
    max: 5 // Maximum rating value
  },
  review: {
    type: String,
    required: false,
    trim: true // Automatically trim the review text
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically set the date when the rating is created
  }
});

const RecipeRating = mongoose.model('RecipeRating', recipeRatingSchema);
module.exports = RecipeRating;
