const Invest = require("./models/investSchema");
const Crypto = require("./models/cryptoSchema");
const Stock = require("./models/stockSchema");
const moment = require("moment-timezone");
const betResultInv = require("./utils/betResultInv");
const setReturns = require("./utils/setReturns");
const setReturns2 = require("./utils/setReturns2");

const winLoss = require("./utils/winLoss");
const schedule = require("node-schedule");
require("./db/mongoose");


const setReturnss = async () => {
  setReturns();
};
schedule.scheduleJob("30 21 * * *", () => {
  setReturnss();
});

const setReturnss2 = async () => {
  setReturns2();
};
schedule.scheduleJob("30 21 * * FRI", () => {
  setReturnss2();
});



const winLosss = async () => {
  const investmentstock = await Invest.find({ category: "stocks", dayWeek: "day" });
    winLoss((data) => {
      investmentstock.forEach(async (stock) => {
        console.log(stock.Code, stock.change, data);
        if (stock.change > data) {
          Invest.updateMany(
            { Code: stock.Code },
            { status: "won", percentile: data },
            (req, res) => {
              console.log(res);
            }
          );
        } else {
          Invest.deleteMany({ Code: stock.Code }, (req, res) => {
            console.log(res);
          });
        }
      });
    });
};
schedule.scheduleJob("35 21 * * *", () => {
  winLosss();
});

/*const setReturns = async () => {
  var day = moment.utc().format("DD");
  var month = moment.utc().format("MM");
  var date = moment.utc().format("MM-DD HH:mm");
  const investmentstock = await Invest.find({ category: "stocks" });
  const investmentcrypto = await Invest.find({ category: "crypto" });
  if (
    date == moment.utc().format(`${month}-${day} 22:03`) &&
    (investmentcrypto.length !== 0 || investmentstock.length !== 0)
  ) {
    const higheststock = await Stock.findOne({}).sort({return:-1}).limit(1);;
    const highestcrypto = await Crypto.findOne({}).sort({return:-1}).limit(1);;
    console.log(higheststock.ticker, highestcrypto.ticker)
    betResultInv(higheststock.ticker, "stocks");
    betResultInv(highestcrypto.symbol, "crypto");
  };
};
schedule.scheduleJob("0 0 * * 0", () => {
  setReturns();
});*/




const clearTokens = async () => {
  Profile.updateMany(
    {
      tokens: { $exists: true, $gt: 0 },
    },{bettokens: 0, returntokens:0},
    (err, res) => {
      console.log(res);
    }
  );
};
schedule.scheduleJob("0 0 * * 0", () => {
  clearTokens();
});



/*const checkReturn = async () => {
  var day = moment.utc().format("DD");
  var month = moment.utc().format("MM");
  var date = moment.utc().format("MM-DD HH:mm");
  const investmentstock = await Invest.find({ category: "stocks" });
  //const investmentcrypto = await Invest.find({ category: "crypto" });
  const today = new Date();
  

  if (
    date == moment.utc().format(`${month}-${day} 22:00`) &&
    investmentstock.length !== 0 && today.getDay() !== 6 &&
    today.getDay() !== 0
  ) {
    console.log('here')
    stockPrice((error, highest) => {
      if (error) {
        return console.log(error);
      }
    });
  }
  

  if (
    date == moment.utc().format(`${month}-${day} 22:03`) &&
    (investmentstock.length !== 0) && today.getDay() !== 6 &&
    today.getDay() !== 0
  ) {
    const higheststock = await Stock.findOne({}).sort({return:-1}).limit(1);;
    console.log(higheststock.ticker)
    betResultInv(higheststock.ticker, "stocks");
  };

};
setInterval(checkReturn, 60000);*/





