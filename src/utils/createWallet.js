const http = require("https");


const createWallet = () => {
  
    const options = {
        "method": "GET",
        "hostname": "api-us-west1.tatum.io",
        "port": null,
        "path": "/v3/ethereum/wallet",
        "headers": {
          "x-api-key": "0fdf3b86-9db3-493b-adac-247ed57fc9f6"
        }
      };
      console.log('hello')
      
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
      
      req.end();
  };

module.exports = createWallet;
