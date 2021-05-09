const mongoose = require("mongoose");
const cryptoSchema = new mongoose.Schema({
   Crypto: { type: String, required: true },
  symbol: { type: String, required: true },
  return: { type: Number, required: true },
  Odds: { type: Number, required: true },
});
const Crypto = mongoose.model("Crypto", cryptoSchema);

module.exports = Crypto;
