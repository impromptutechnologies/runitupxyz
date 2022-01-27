const { callbackify } = require("util");

const getBalance = (id, callback) => {

const http = require("https");

const options = {
    "method": "GET",
    "hostname": "api-us-west1.tatum.io",
    "port": null,
    "path": `/v3/ledger/account/${id}/balance`,
    "headers": {
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
      const jsonify = JSON.parse(body.toString())
      console.log(jsonify.availableBalance)
      callback(jsonify.availableBalance)
      //return callback(body.toString());
    });
  });
  
  req.end();
}


module.exports = getBalance;
