const http = require("https");


const deployToken = () => {
    const options = {
        "method": "POST",
        "hostname": "api-us-west1.tatum.io",
        "port": null,
        "path": "/v3/blockchain/token/deploy",
        "headers": {
          "content-type": "application/json",
          "x-api-key": "0fdf3b86-9db3-493b-adac-247ed57fc9f6"
        }
      };
      
      const req = http.request(options, function (res) {
        const chunks = [];
        console.log('hey1')

        res.on("data", function (chunk) {
            console.log('hey1')

          chunks.push(chunk);
        });
      
        res.on("end", function () {
        console.log('hey')
          const body = Buffer.concat(chunks);
          console.log(body.toString());
        });
      });
      
      req.write(JSON.stringify({
        chain: 'BSC',
        symbol: 'TCJW',
        name: 'TESTCOINJW',
        totalCap: '1000000',
        supply: '1000000',
        digits: 2,
        address: '0x5fE0b0102562911495d5af34a2dF728fd0D439c8',
        fromPrivateKey: '6522fec3370780a1475f387679061b93f7c07c74de1bebd0c0e1d9043aeff337',
        //nonce: 0,
        //fee: {gasLimit: '200000', gasPrice: '20'}
      }));
      req.end();
}


module.exports = deployToken;
