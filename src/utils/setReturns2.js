const request = require("request");
const Invest = require("../models/investSchema");

const moment = require("moment-timezone");

const setReturns2 = async (callback) => {

    Invest.find({dayWeek: 'week'}, (error, stocks) => {
        const date = moment.utc().subtract(1, "days").format("YYYY-MM-DD");
        stocks.forEach((stock) => {
          console.log(stock)
          if(stock.status == "open"){
            console.log(stock.Code, date)
            //const url = `http://api.marketstack.com/v1/eod/${date}?access_key=${process.env.STOCK_API}&symbols=${stock.Code}&limit=1`;
            const url = `https://api.polygon.io/v1/open-close/${stock.Code}/${date}?adjusted=true&apiKey=frJF3PXjMq3iUKYOJP9pEJxVB0dMIMdP`;
            console.log(url)
            request ({ url, json: true },(error, { body }) => {
                //console.log(body["data"][stock.ticker])
                if (error) {
                  console.log("Unable to connect", undefined);
                } else if (body.length === 0) {
                  console.log("No Stocks", undefined);
                } else {
                  console.log(body)
                  //closingChange = body["data"][stock.Code].netPercentChangeInDouble;
                  closingChange = (((body.close)-(body.open))/(body.open))*100;
                  console.log(stock.Code, closingChange)
                  Invest.updateMany({Code: stock.Code}, { change: closingChange}, (error, stock) => {
                        if(error){
                            console.log(error)
                        }
                  })
                }
              }); 
          }
            
        }) 

    });
};

module.exports = setReturns2;