
const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
    userID: {type:String, required:true, unique:true},
    username: {type:String, required:true},
    serverID: {type:String, required:true},
    tokens: {type: Number, default:0, required:true},
    returntokens: {type: Number, default:0},
    bettokens: {type: Number, default:0},
    payments:[],
    depositAddress:{type:String, required:false},
    cryptoBalance:{type:Number, default:0},
    invites: {type: Number, default:0},
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;