const request = require("request");
const Crypto = require("../models/cryptoSchema");
const rp = require('request-promise');

const cryptoPrice = () => {
    Crypto.find({}, (error, cryptos) => {
      cryptos.forEach((crypto) => {
          console.log(crypto.symbol)
          const CoinMarketCap = require('coinmarketcap-api')
          const apiKey = '992b34d4-f844-4fe2-85f0-3979f7a206af'
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
  });
};

module.exports = cryptoPrice;
