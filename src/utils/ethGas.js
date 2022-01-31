const http = require("https");
const Profile = require("../models/profileSchema");

const depositAddress = (callback) => {
    const options = {
        "method": "POST",
        "hostname": "api-us-west1.tatum.io",
        "port": null,
        "path": "/v3/ethereum/gas",
        "headers": {
          "content-type": "application/json",
          "x-api-key": process.env.API_TATUM,
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
          callback(body.toString().estimations.standard)
        });
      });
      
      req.write(JSON.stringify({
        from: '0x976683dd1def30018060669965061a8c2b97001e',
        to: '0x5fE0b0102562911495d5af34a2dF728fd0D439c8',
        amount: '0.006',
      }));
      req.end();      

}

module.exports = depositAddress;
