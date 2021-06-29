const mongoose = require("mongoose");
const betSchema = new mongoose.Schema({
  creatorID: { type: String, required: true },
  serverID: { type: String, required: false },
  channelID: { type: String, required: false },
  creatorName: { type: String, required: true },
  status: { type: String, required: true},
  outcomeID: { type: String, required: true },
  betAmount: { type: Number, required: true },
  Code: { type: String, required: true },
  betOdds: { type: Number, required: true },
  possibleWinnings: { type: Number, required: true },
});
const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;
