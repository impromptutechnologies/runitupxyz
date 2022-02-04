
const mongoose = require('mongoose');
const profileSchema = new mongoose.Schema({
    userID: {type:String, required:true, unique:true},
    username: {type:String, required:true},
    serverID: {type:String, required:true},
    tokens: {type: Number, default:0, required:false},
    customerID: {type: String, default:0, required:false},
    returntokens: {type: Number, default:0},
    bettokens: {type: Number, default:0},
    payments:[],
    lastTransaction: {type:String, required:false, default:"no"},
   /*depositAddress:{type:String, required:false},
    derivationKey:{type:String, required:false},
    privateKey:{type:String, required:false},
    cryptoBalance:{type:Number, default:0},
    invites: {type: Number, default:0},*/
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;