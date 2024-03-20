const mongoose = require("mongoose");

let questionsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },

});

const question = mongoose.model("security_questions", questionsSchema);
module.exports = question;
