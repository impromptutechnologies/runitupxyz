const request = require("request");
const Stock = require("../models/stockSchema");

const moment = require("moment-timezone");

const stockPrice = (callback) => {

    Stock.find({}, (error, stocks) => {
        const date = moment.utc().format("YYYY-MM-DD");
        console.log(date);
        stocks.forEach((stock) => {
            console.log(stock.ticker)
            const url = `http://api.marketstack.com/v1/eod/${date}?access_key=${process.env.STOCK_API}&symbols=${stock.ticker}&limit=1`;
            console.log(url)
            request ({ url, json: true },(error, { body }) => {
                console.log(body)
                if (error) {
                  console.log("Unable to connect", undefined);
                } else if (body.length === 0) {
                  console.log("No Stocks", undefined);
                } else {
                  closingChange = (((body.data[0].close)-(body.data[0].open))/(body.data[0].open))*100;
                  Stock.findOneAndUpdate({ticker: stock.ticker}, { return: closingChange}, (error, stock) => {
                        if(error){
                            console.log(error)
                        }
                  })
                }
              }); 
          }) 

    });
    /*Stock.find({}, (error, highest) => {
        callback(highest)
    }).sort({return:-1}).limit(1);*/
    
      

};

module.exports = stockPrice;
