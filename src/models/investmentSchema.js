const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema({
  investmentID: { type: String, required: true },
  category: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  code1: { type: String, required: true },
  code2: { type: String, required: true },
  totalInvested1: { type: Number, required: true },
  totalInvested2: { type: Number, required: true },
  timeStart: { type: String, required: true },
  timeEnd: { type: String, required: true },
});


const Investment = mongoose.model("Investment", investmentSchema);

module.exports = Investment;
