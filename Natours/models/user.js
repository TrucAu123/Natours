const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMon = require('passport-local-mongoose')
const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullname:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    }

});

userSchema.plugin(passportLocalMon); //give username and password
const User = mongoose.model('User', userSchema);
module.exports = User;