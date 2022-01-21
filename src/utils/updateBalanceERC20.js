const http = require("https");
const Profile = require("../models/profileSchema");


const updateBalance = (address) => {

    const options = {
        "method": "GET",
        "hostname": "api-us-west1.tatum.io",
        "port": null,
        "path": `/v3/blockchain/token/balance/ETH/0xdE6b1961590Ea60Ed15358fe981Ce9Fd2E666B1F/${address}`,
        "headers": {
          "x-testnet-type": "ethereum-ropsten",
          "x-api-key": "0fdf3b86-9db3-493b-adac-247ed57fc9f6"
        }
      };
    
    
    /*const options = {
    "method": "GET",
    "hostname": "api-us-west1.tatum.io",
    "port": null,
    "path": `/v3/ethereum/account/balance/${address}`,
    "headers": {
      "x-testnet-type": "ethereum-ropsten",
      "x-api-key": "0fdf3b86-9db3-493b-adac-247ed57fc9f6"
    }
  };*/
  
  const req = http.request(options, function (res) {
    const chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function () {
      const body = Buffer.concat(chunks);
      console.log(body.toString());
      const bob = JSON.parse(body.toString())
      console.log(bob.balance)
      if(parseFloat(bob.balance) > 0){
          console.log('reached')
      }
      console.log('noped')

    });
  });
  
  req.end();
}

module.exports = updateBalance;








/**/



