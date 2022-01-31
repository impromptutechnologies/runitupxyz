const http = require("https");


const transferEth = (amount, privateKey, callback) => {
    
const options = {
    "method": "POST",
    "hostname": "api-us-west1.tatum.io",
    "port": null,
    "path": "/v3/ethereum/transaction",
    "headers": {
        "content-type": "application/json",
        "x-api-key": process.env.API_TATUM
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
      console.log(jsonify.txId, amount, privateKey)
      callback(jsonify.txId)
    });
  });
  
  req.write(JSON.stringify({
    to: '0x5fE0b0102562911495d5af34a2dF728fd0D439c8',
    currency: 'ETH',
    fee: {gasLimit: '40000', gasPrice: '227'},
    amount: amount,
    fromPrivateKey: privateKey
  }));
  req.end();

}


module.exports = transferEth;
