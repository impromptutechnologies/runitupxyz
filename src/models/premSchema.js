const mongoose = require("mongoose");
const premSchema = new mongoose.Schema({
  command: { type: String, required: true },
  description: { type: String, required: true },
});
const Prem = mongoose.model("Prem", premSchema);

module.exports = Prem;
