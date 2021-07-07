const Outcome = require("./models/outcomeSchema");
const Invest = require("./models/investSchema");
const Crypto = require("./models/cryptoSchema");
const Stock = require("./models/stockSchema");
const Profile = require("./models/profileSchema");
const moment = require("moment-timezone");
const betResult = require("./utils/betresult");
const betResultBasketball = require("./utils/betResultBasketball");
const betResultEsports = require("./utils/betResultEsports");
const betResultInv = require("./utils/betResultInv");
const stockPrice = require("./utils/stockprice");
const cryptoPrice = require("./utils/cryptoprice");
const cryptoPriceOpen = require("./utils/cryptopriceopen");
const newMatchesSoccer = require("./utils/newmatches");
const newMatchesBasketball = require("./utils/newmatchesb");
const newMatchesEsports = require("./utils/newmatchese");
const schedule = require("node-schedule");
const setOddsB = require("./utils/setOddsB");
const setOdds = require("./utils/setOdds");
require("./db/mongoose");

const newMatches = async () => {
  console.log('firedoff')
  newMatchesEsports();
  newMatchesBasketball("1");
  newMatchesBasketball("2");
  newMatchesBasketball("3");
  newMatchesSoccer("euros");
  //setTimeout(newMatchesSoccer.bind(null, 'prem'), 60000)
  //setTimeout(newMatchesSoccer.bind(null, 'champ'), 120000)
  //setTimeout(newMatchesSoccer.bind(null, 'seriea'), 180000)
  //setTimeout(newMatchesSoccer.bind(null, 'euros'), 180000)
};
schedule.scheduleJob("0 */6 * * *", () => {
  newMatches();
});


const checkOdds = async () => {
  Outcome.find(
    {
      category: "soccer",
      option1: { $exists: true, $eq: [] },
    },
    (err, res) => {
      console.log(res);
      res.forEach((element) => {
        setOdds(element.league, element.outcomeID);
      });
    }
  );
  Outcome.find(
    {
      category: "basketball",
      option1: { $exists: true, $eq: [] },
    },
    (err, res) => {
      console.log(res);
      res.forEach((element) => {
        setOddsB(element.outcomeID);
      });
    }
  );
};
schedule.scheduleJob("55 */1 * * *", () => {
  checkOdds();
});




const setTokens = async () => {
  Profile.updateMany(
    {
      tokens: { $exists: true, $gt: 0 },
    },[
      {"$set": {"returntokens": '$tokens' }}
  ],
    (err, res) => {
      console.log(res);
    }
  );
};
schedule.scheduleJob("0 0 * * 0", () => {
  setTokens();
});





const checkReturn = async () => {
  var day = moment.utc().format("DD");
  var month = moment.utc().format("MM");
  var date = moment.utc().format("MM-DD HH:mm");
  const investmentstock = await Invest.find({ category: "stocks" });
  const investmentcrypto = await Invest.find({ category: "crypto" });
  if (
    date == moment.utc().format(`${month}-${day} 13:28`) &&
    investmentcrypto.length !== 0
  ) {
    cryptoPriceOpen((error, highest) => {
      if (error) {
        return console.log(error);
      }
    });
  }

  if (
    date == moment.utc().format(`${month}-${day} 22:00`) &&
    investmentstock.length !== 0
  ) {
    stockPrice((error, highest) => {
      if (error) {
        return console.log(error);
      }
    });
  }
  if (
    date == moment.utc().format(`${month}-${day} 22:00`) &&
    investmentcrypto.length !== 0
  ) {
    cryptoPrice((error, highest) => {
      if (error) {
        return console.log(error);
      }
    });
  }

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
setInterval(checkReturn, 60000);









const updateMatches = async () => {
  var date = moment.utc().format("MM-DD HH:mm");
  const outcomes = await Outcome.find({ timeEnd: { $lt: date } });
  if (outcomes.length == 0) {
    console.log("no finished matches across the board");
  } else {
    console.log(outcomes);
    outcomes.forEach((element) => {
      if (element.category == "esportscod") {
        betResultEsports(element.outcomeID,{
          method: "GET",
          url: `https://api.pandascore.co/codmw/matches/?filter[id]=${element.outcomeID}`,
          headers: {
            Authorization:
              process.env.PANDASCORE_API,
            host: "api.pandascore.co",
            useQueryString: true,
          },
        });
      }
      if (element.category == "esportscsgo") {
        betResultEsports(element.outcomeID,{
          method: "GET",
          url: `https://api.pandascore.co/csgo/matches/?filter[id]=${element.outcomeID}`,
          headers: {
            Authorization:
            process.env.PANDASCORE_API,
            host: "api.pandascore.co",
            useQueryString: true,
          },
        });
      }
      if (element.category == "esportsdota") {
        betResultEsports(element.outcomeID, {
          method: "GET",
          url: `https://api.pandascore.co/dota2/matches/?filter[id]=${element.outcomeID}`,
          headers: {
            Authorization:
            process.env.PANDASCORE_API,
            host: "api.pandascore.co",
            useQueryString: true,
          },
        });
      }
      if (element.category == "esportslol") {
        betResultEsports(element.outcomeID, {
          method: "GET",
          url: `https://api.pandascore.co/lol/matches/?filter[id]=${element.outcomeID}`,
          headers: {
            Authorization:
            process.env.PANDASCORE_API,
            host: "api.pandascore.co",
            useQueryString: true,
          },
        });
      }
      if (element.category == "basketball") {
        betResultBasketball(element.outcomeID);
      }
      if (element.category == "soccer") {
        betResult(element.outcomeID);
      }
    });
    const deleted = await Outcome.deleteMany({ timeEnd: { $lt: date } });
  }
};
setInterval(updateMatches, 60000);
