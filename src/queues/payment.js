const Queue = require('bull');
const paypal = require("paypal-rest-sdk");
require("../db/mongoose");
require("dotenv").config();
const Profile = require("../models/profileSchema");

paypal.configure({
    mode: "sandbox", //sandbox or live
    //'client_id': 'AYGEOzs1ivvoOXqHhdoWWZc0KGLUdcZ-YehnqROBBBzzfGeUecNQOcHzbo7CCHnqEw_PNpovgmqhj_d_',
    //'client_secret': 'EAvzD2BzwmUqlTKHTMjDONvk_1CHqFQunsbk8TICaeq21jXBqFB0bkBVBvmwea7zR6uMtfUV6jwNQGlH'
    client_id: process.env.CLIENT_IDPYPL,
    client_secret: process.env.CLIENT_SECRET,
  });

// 1. Initiating the Queue
const paymentQueue = new Queue('pay', process.env.REDIS_URL);

const completePayment = (prof, tokens, id, value) => {
    const data = {
        profile: prof,
        tokens: tokens,
        paymentId: id,
        json: value,
    };
    paymentQueue.add(data);
    return console.log('ok')
}


// 3. Consumer
paymentQueue.process(async job => { 
    return pay(job.data.profile, job.data.tokens, job.data.paymentId, job.data.json); 
});


function pay(prof, tokens, paymentId, json) {
    console.log(prof)
    const userProfile = await Profile.findOne({
        userID: prof,
      }).sort({ userID: 1 });
    paypal.payment.execute(
        paymentId,
        json,
        function (error, payment) {
          if (error) {
            throw error;
          } else {
            if (userProfile.payments.includes(payment.id)) {
              //return res.redirect("/tokens");
              return true;
            } else {
              userProfile.payments.push(payment.id);
              userProfile.tokens = tokens + 17645;
              userProfile.save();
              return true;
              //return res.redirect("/tokens");
            }
          }
        }
      );
}


module.exports = completePayment






