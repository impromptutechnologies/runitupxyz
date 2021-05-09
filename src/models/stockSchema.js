const mongoose = require("mongoose");
const stockSchema = new mongoose.Schema({
   company: { type: String, required: true },
  ticker: { type: String, required: true },
  return: { type: Number, required: true },
  Odds: { type: Number, required: true },
});
const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
