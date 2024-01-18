const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    'uname':{
        required: true,
        type: String
    },
    'uemail':{
        required: true,
        type: String
    },
    'upass':{
        required: true,
        type: String
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
    }
});

const User = mongoose.model("user",userSchema);
module.exports = User;