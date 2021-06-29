const Invest = require("../models/investSchema");
const Profile = require("../models/profileSchema");

const betResultInv = (highest, category) => {
  Invest.updateMany({ Code: highest, category: category }, { status: "won" }, (err, res) => {
    if (err) {
      console.log(err);
    }
  });
  Invest.deleteMany(
    {
      Code: { $ne: highest },
    },
    (error, deleted) => {
      if (error) {
        console.log(error);
      }
    }
  );
};

module.exports = betResultInv;
