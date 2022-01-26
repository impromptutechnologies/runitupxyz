const mongoose = require('mongoose');
const withdrawSchema = new mongoose.Schema({
    userID: {type:String, required:true},
    crypto:{type:String, required:true},
    tokens: {type:Number, required:true},
    address: {type:String, required:true},
});
const Withdraw = mongoose.model('Withdraw', withdrawSchema);

module.exports = Withdraw;