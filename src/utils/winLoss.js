const request = require("request");
const Invest = require("../models/investSchema");

const percentile = require("percentile");

const moment = require("moment-timezone");

const winLoss = async (callback) => {
    const betStock = await Invest.find({});
    let matcheslist = [];
    betStock.forEach((bet) => {
        matcheslist.push(bet.change);
        //console.log(i, match.playerStats.teamPlacement, match.mode, match.utcStartSeconds, bet.timeEnd, endtime);
        //&& (starttime/1000) < match.utcStartSeconds    
    })  
    console.log(percentile(45, matcheslist))
    callback(percentile(45, matcheslist))
    /*betStock.forEach((stock) => {
        if (stock.change > percentilel) {
             betStockDaySchema.findOneAndUpdate(
              { customerID: stock.customerID },
              { status: 'won'  }, (req, res) => {
                console.log(res)
              });
          } else {
             betStockDaySchema.findOneAndUpdate(
                { customerID: stock.customerID },
                { status: 'lost'  }, (req, res) => {
                  console.log(res)
                });
          }

    })*/
   
};
        


module.exports = winLoss;