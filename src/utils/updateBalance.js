const http = require("https");
const Profile = require("../models/profileSchema");


const updateBalance = (address, balance) => {
    
    const options = {
    "method": "GET",
    "hostname": "api-us-west1.tatum.io",
    "port": null,
    "path": `/v3/ethereum/account/balance/${address}`,
    "headers": {
      "x-api-key": "0fdf3b86-9db3-493b-adac-247ed57fc9f6"
    }
  };
  
  const req = http.request(options, function (res) {
    const chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      const body = Buffer.concat(chunks);
      console.log(body.toString());
      const bob = JSON.parse(body.toString())
      console.log(bob.balance, balance)
      if(parseFloat(bob.balance) > balance){
          console.log('reached')
          const increase = bob.balance - balance;
          const tokeninc = increase * 10000;
          const coinUpdate = Profile.findOneAndUpdate(
            { userID:'834304396673679411'},
            { cryptoBalance: bob.balance, $inc: { tokens: tokeninc } }, (req, res) => {
                console.log(res)
            }
            
          );

      }
      console.log('noped')

    });
  });
  
  req.end();
}

module.exports = updateBalance;








/*const options = {
  "method": "GET",
  "hostname": "api-w1.tatum.io",
  "port": null,
  "path": "/v3/blockchain/token/balance/{chain}/{contractAddress}/{address}",
  "headers": {
    "x-testnet-type": "SOME_STRING_VALUE",
    "x-api-key": "REPLACE_KEY_VALUE"
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();*/



