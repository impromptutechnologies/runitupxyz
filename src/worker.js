const Outcome = require("./models/outcomeSchema");
const Invest = require("./models/investSchema");
const moment = require("moment-timezone");
const stockPrice = require("./utils/stockprice");
const cryptoPrice = require("./utils/cryptoprice");
const cryptoPriceOpen = require("./utils/cryptopriceopen");
const newMatchesSoccer = require("./utils/newmatches");
const newMatchesBasketball = require("./utils/newmatchesb");
const newMatchesEsports = require("./utils/newmatchese");
const schedule = require('node-schedule')
const setOddsB = require("./utils/setOddsB");
const setOdds = require("./utils/setOdds");


  const newMatches = async () => {
    newMatchesEsports();
    newMatchesBasketball("1");
    newMatchesBasketball("2");
    newMatchesBasketball("3");
    //newMatchesSoccer("euros");
    //setTimeout(newMatchesSoccer.bind(null, 'prem'), 60000)
    //setTimeout(newMatchesSoccer.bind(null, 'champ'), 120000)
    //setTimeout(newMatchesSoccer.bind(null, 'seriea'), 180000)
    //setTimeout(newMatchesSoccer.bind(null, 'euros'), 180000)
  }
 schedule.scheduleJob('0 */6 * * *', ()=>{
    newMatches();
  })


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
}
schedule.scheduleJob('55 */1 * * *', ()=>{
  checkOdds();
})

  







  const checkReturn = async () => {
    var day = moment.utc().format("DD");
    var month = moment.utc().format("MM");
    var date = moment.utc().format("MM-DD HH:mm");
    const investmentstock = await Invest.find({ category: "stocks" });
    const investmentcrypto = await Invest.find({ category: "crypto" });
    console.log("stock invests total:", investmentstock.length);
    console.log("crypto invests total:", investmentcrypto.length);
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
      date == moment.utc().format(`${month}-${day} 21:30`) &&
      investmentstock.length !== 0
    ) {
      stockPrice((error, highest) => {
        if (error) {
          return console.log(error);
        }
      })
    }
    if (
      date == moment.utc().format(`${month}-${day} 21:30`) &&
      investmentcrypto.length !== 0
    ) {
      cryptoPrice((error, highest) => {
        if (error) {
          return console.log(error);
        }
      });
    }
  };
  setInterval(checkReturn, 60000);
