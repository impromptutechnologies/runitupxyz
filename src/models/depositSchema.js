const mongoose = require('mongoose');
const depositSchema = new mongoose.Schema({
    userID: {type:String, required:true},
    crypto:{type:String, required:true},
    tokens: {type:String, required:true},
    address: {type:String, required:true},
});
const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;