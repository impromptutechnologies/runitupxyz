const request = require("request");
const Crypto = require("../models/cryptoSchema");
const rp = require('request-promise');
const CoinMarketCap = require('coinmarketcap-api')


const cryptoPrice = () => {
    Crypto.find({}, (error, cryptos) => {
      cryptos.forEach((crypto) => {
          const apiKey = process.env.COIN_API
          const client = new CoinMarketCap(apiKey)
          client.getQuotes({symbol: crypto.symbol, convert: 'USD'}).then(response => {
            const yourReturn = (response.data[crypto.symbol].quote.USD.price - crypto.openPrice)/crypto.openPrice
            Crypto.findOneAndUpdate({symbol: crypto.symbol}, { return:yourReturn }, (error, crypto) => {
                  if(error){
                      console.log(error)
                  } 
            })
          });
        }) 
  }).lean();
};

module.exports = cryptoPrice;
