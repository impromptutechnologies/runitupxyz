const http = require("https");
const Profile = require("../models/profileSchema");

const depositAddress = () => {

const options = {
    "method": "GET",
    "hostname": "api-us-west1.tatum.io",
    "port": null,
    "path": "/v3/ethereum/address/xpub6EGmMwZZGCQ6bN88khrrqNsgwqv8R47ZnEUP9MkYbDVSmgrekTC49QdJpezvgmrJB4qVdCNGWJfiPoa6yhwig7zvXshGoFtirDbE7cUeV6v/0",
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
      console.log(bob.address)
      const coinUpdate = Profile.findOneAndUpdate(
        { userID:'834304396673679411'},
        { depositAddress: bob.address }, (req, res) => {
            console.log(res)
        }
        
      );
    });
  });
  
  req.end();

}


module.exports = depositAddress;
