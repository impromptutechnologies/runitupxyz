const { randomBytes } = require("crypto");
const request = require("request");
const Profile = require("../models/profileSchema");


const createAccount = async (email) => {

    const http = require("https");

const options = {
  "method": "POST",
  "hostname": "api-us-west1.tatum.io",
  "port": null,
  "path": "/v3/ledger/account",
  "headers": {
    "content-type": "application/json",
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
    const jsonify = JSON.parse(body.toString())
    let profile = await Profile.create({
        userID: email,
        customerID: jsonify.id,
        depositAddress: '',
      });
    await profile.save();
  });
});

req.write(JSON.stringify({
  currency: 'ETH',
  xpub: 'xpub6DfuofXD5DNRzQfzfRz9CDatRv7KrHdUxV6S2FUbwAE4yBnRW9fV8qanBz2uuuDL43vPXNrt1rwgLUs1FA9nYFrWgocAMzK7SMTdwtk6bed',
  customer: {
    accountingCurrency: 'USD',
    customerCountry: 'US',
    externalId: id,
    providerCountry: 'US'
  },
  compliant: false,
  accountCode: 'AC_1011_B',
  accountingCurrency: 'USD',
  accountNumber: '123456'
}));

req.end();



};



module.exports = createAccount;