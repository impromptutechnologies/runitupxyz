const mongoose = require('mongoose');
const casinoSchema = new mongoose.Schema({
    command: {type:String, required:true},
    description: {type:String, required:true},
});
const Casino = mongoose.model('Casino', casinoSchema);

module.exports = Casino;