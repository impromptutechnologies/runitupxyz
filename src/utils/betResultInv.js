const Invest = require("../models/investSchema");
const Profile = require("../models/profileSchema");

const betResultInv = (highest, category) => {
  console.log(highest)
  Invest.updateMany({ Code: highest, category: category }, { status: "won" }, (err, res) => {
    if (err) {
      console.log(err);
    }
    console.log(res)
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
  });
};

module.exports = betResultInv;
