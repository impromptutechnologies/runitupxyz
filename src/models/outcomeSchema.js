const mongoose = require("mongoose");

const outcomeSchema = new mongoose.Schema({
  outcomeID: { type: String, required: true, unique:false},
  category: { type: String, required: true },
  league:{ type: String, required: false },
  desc: {type: String, required: false},
  spec:{type: String, required: false},
  team1: { type: String, required: true},
  team2: { type: String, required: true },
  timeStart: { type: String, required: true },
  timeEnd: { type: String, required: true },
  option1: [
    {
      Code: {
        type: String,
        required: true,
      },
      odds: {
        type: Number,
        required: true,
      },
      Code2: {
        type: String,
        required: true,
      },
      odds2: {
        type: Number,
        required: true,
      },
      Code3: {
        type: String,
      },
      odds3: {
        type: Number,
      },
    },
  ],
});

outcomeSchema.methods.addOptions = function (option1) {
  const user = this;
  const Code = option1[0];
  const odds = option1[1];
  const Code2 = option1[2];
  const odds2 = option1[3];
  const Code3 = option1[4];
  const odds3 = option1[5];
  user.option1 = user.option1.concat({
    Code,
    odds,
    Code2,
    odds2,
    Code3,
    odds3,
  });
};

const Outcome = mongoose.model("Outcome", outcomeSchema);

module.exports = Outcome;
