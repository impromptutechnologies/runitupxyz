const express = require('express')
const path = require('path')
const hbs = require('hbs')
const Profile = require('./models/profileSchema')
const Outcome = require('./models/outcomeSchema')
const Bet = require('./models/betSchema')
const Casino = require('./models/casinoSchema')
const Stock = require('./models/stockSchema.js')
const Prem = require('./models/premSchema.js')
const Withdraw = require('./models/withdrawSchema.js')
const WAValidator = require("wallet-address-validator")

const Crypto = require('./models/cryptoSchema.js')
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const paypal = require('paypal-rest-sdk');
const dirname = __dirname
require('./db/mongoose')



const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://meow-web.herokuapp.com',
    clientID: 'wwH72gzRvTZB6mgXqB60tnc9lgppWShC',
    issuerBaseURL: 'https://meowbot.us.auth0.com'
  };


paypal.configure({
    'mode': 'live', //sandbox or live
    //'client_id': 'AYGEOzs1ivvoOXqHhdoWWZc0KGLUdcZ-YehnqROBBBzzfGeUecNQOcHzbo7CCHnqEw_PNpovgmqhj_d_',
    //'client_secret': 'EAvzD2BzwmUqlTKHTMjDONvk_1CHqFQunsbk8TICaeq21jXBqFB0bkBVBvmwea7zR6uMtfUV6jwNQGlH'
    'client_id':'AXNiXr4W1Na95IWXtOtd6HBTBXmT4hq8GG-t9DhdeTYFOtRoveoVDWUylWhK4GQg_7YfenJ5t4Ki2StI',
    'client_secret':'EIt7FQhJhPjvStUB-tp-C8hrbxeerJuLjKEI9Tz_EJwMYDMDiULtq473bnn0HYjTzP_IdzeJwnMlSkOi',
    
  });


const app = express()
const port = process.env.PORT || 3000
require("dotenv").config();
const moment = require('moment-timezone')


//Define paths for express config
const publicdirectory = path.join(dirname, '../public')
const viewsPath = path.join(__dirname, '../templates')
const partialsPath = path.join(__dirname, '../templates/partials')

//handle and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)*
//set up static directory
app.use(express.static(publicdirectory))
app.use(auth(config));
app.use(express.urlencoded({
    extended: true
  }))
hbs.registerHelper('substring', function (aString) {
    var theString = (aString.substring(0,5) + "...");
    return new hbs.SafeString(theString)
})


app.get('/', (req, res) => {
    //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    res.render('index');
})

app.post('/callback', requiresAuth(), async (req, res) => {
    res.redirect('account')
})

app.get('/account', requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({userID:(req.oidc.user.sub).substring(15, 34)});
    const userBets = await Bet.find({creatorID:(req.oidc.user.sub).substring(15, 34)});
    const userWithdraws = await Withdraw.find({userID:(req.oidc.user.sub).substring(15, 34)});
    res.render('account', {userWithdraws:userWithdraws, userBets: userBets, id: userProfile.userID, profileImage: req.oidc.user.picture, username: req.oidc.user.name, coins: Math.round(userProfile.coins, 2)});
})

app.post('/auth/withdraw', requiresAuth(), async (req, res) => {
    console.log(req.body.tokens, req.body.address)
    const coins = await Profile.findOne({userID:(req.oidc.user.sub).substring(15, 34)})
    console.log(coins.coins)
    const validbtc = WAValidator.validate(req.body.address, "BTC")
    const valideth = WAValidator.validate(req.body.address, "ETH")
    console.log(validbtc, valideth)
    if(valideth == true){
        const coinUpdate = await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {coins: parseInt(coins.coins - req.body.tokens)});
        const withdraw = await Withdraw.create(
        {userID: (req.oidc.user.sub).substring(15, 34), crypto:  "ethereum", tokens: req.body.tokens, address: req.body.address}
        );
    }
    if(validbtc == true){
        const coinUpdate = await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {coins: parseInt(coins.coins - req.body.tokens)});
        const withdraw = await Withdraw.create(
        {userID: (req.oidc.user.sub).substring(15, 34), crypto: "bitcoin" , tokens: req.body.tokens, address: req.body.address}
        );
    }

    
    //const userProfile = await Profile.findOne({userID:(req.oidc.user.sub).substring(15, 34)});
    //const userBets = await Bet.find({creatorID:(req.oidc.user.sub).substring(15, 34)});
    res.redirect('/account');
})

app.get('', (req, res) => {
    res.render('index')
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/testing', (req, res) => {
    res.send('testing')
})  

app.get('/arena', (req, res) => {
    res.render('arena')
})  


app.get('/bets', async (req, res) => {
    try{
        var date = moment.utc().format("MM-DD HH:mm");
        const outcomesp = await Outcome.aggregate([
            {
                $match: {
                    'category': 'soccer',
                    'league': 'prem',
                    'timeStart': { $gt: date },
                    'option1.0.odds':{ $gt: 0 }
                }
            },{
                $group: {
                    _id: '$outcomeID',
                    "docs": {
                        $first: {
                            "team1": "$team1",
                            "team2": "$team2",
                            "timeStart": "$timeStart",
                            "timeEnd": "$timeEnd",
                            "option1": "$option1",
                        },
                        
                    },
                },
            },
            { "$sort": { "docs.timeStart": 1 } },
        ])
        const outcomesi = await Outcome.aggregate([
            {
                $match: {
                    'category': 'soccer',
                    'league': 'rest',
                    'timeStart': { $gt: date },
                    'option1.0.odds':{ $gt: 0 }
                }
            },{
                $group: {
                    _id: '$outcomeID',
                    "docs": {
                        $first: {
                            "team1": "$team1",
                            "team2": "$team2",
                            "timeStart": "$timeStart",
                            "timeEnd": "$timeEnd",
                            "option1": "$option1",
                        },
                        
                    },
                },
            },
            { "$sort": { "docs.timeStart": 1 } },
        ])
        const outcomesc = await Outcome.aggregate([
            {
                $match: {
                    'category': 'soccer',
                    'league': 'champ',
                    'timeStart': { $gt: date },
                    'option1.0.odds':{ $gt: 0 }
                }
            },{
                $group: {
                    _id: '$outcomeID',
                    "docs": {
                        $first: {
                            "team1": "$team1",
                            "team2": "$team2",
                            "timeStart": "$timeStart",
                            "timeEnd": "$timeEnd",
                            "option1": "$option1",
                        },
                        
                    },
                },
            },
            { "$sort": { "docs.timeStart": 1 } },
        ])

        const outcomese = await Outcome.aggregate([
            {
                $match: {
                    'category': 'soccer',
                    'league': 'euros',
                    'timeStart': { $gt: date },
                    'option1.0.odds':{ $gt: 0 }
                }
            },{
                $group: {
                    _id: '$outcomeID',
                    "docs": {
                        $first: {
                            "team1": "$team1",
                            "team2": "$team2",
                            "timeStart": "$timeStart",
                            "timeEnd": "$timeEnd",
                            "option1": "$option1",
                        },
                        
                    },
                },
            },
            { "$sort": { "docs.timeStart": 1 } },
        ])
        res.render('bet', {outcomes:outcomesp, outcomesi:outcomesi, outcomesc:outcomesc, outcomese:outcomese});
    } catch(err){
        console.log(err);
    }
})

app.get('/betsbb', async (req, res) => {
    var date = moment.utc().format("MM-DD HH:mm");
    try{
        const outcomes = await Outcome.find({category:"basketball", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1});
        res.render('betbasketball', {outcomes:outcomes});
    } catch(err){
        console.log(err);
    }
})

app.get('/betsg', async (req, res) => {
    var date = moment.utc().format("MM-DD HH:mm");
    try{
        const outcomesc = await Outcome.find({category:"esportscod", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1});
        const outcomesd = await Outcome.find({category:"esportsdota", timeStart: { $gt: date }}).sort({timeStart:1});
        const outcomesgo = await Outcome.find({category:"esportscsgo", timeStart: { $gt: date }}).sort({timeStart:1});
        const outcomeslol = await Outcome.find({category:"esportsleague", timeStart: { $gt: date }}).sort({timeStart:1});
        res.render('betgame', {outcomes:outcomesc, outcomesd:outcomesd, outcomesgo:outcomesgo, outcomeslol:outcomeslol});
    } catch(err){
        console.log(err);
    }
})

app.get('/betscr', async (req, res) => {
    try{
        const outcomes = await Crypto.find({});
        res.render('betcrypto', {outcomes:outcomes, time2:'13:30', time1:'20:00'});
    } catch(err){
        console.log(err);
    }
})


app.get('/betsst', async (req, res) => {
    try{
        const outcomes = await Stock.find({});
        res.render('betstock', {outcomes:outcomes, time2:'13:30', time1:'20:00'});
    } catch(err){
        console.log(err);
    }
})

app.get('/casino', async (req, res) => {
    try{
        const casinoCommands = await Casino.find();
        res.render('betcasino', {outcomes:casinoCommands});
    } catch(err){
        console.log(err);
    }
})

app.get('/betsq', async (req, res) => {
    try{
        var date = moment.utc().format("MM-DD HH:mm");
        const outcomes = await Outcome.find({category:"random", timeStart: { $gt: date }}).sort({timeStart:1});
        res.render('betrandom');
    } catch(err){
        console.log(err);
    }
})

/*app.get('/premium', async (req, res) => {
    const premCommands = await Prem.find();
    console.log(premCommands)
    try{
        res.render('premium', {prem:premCommands});
    } catch(err){
        console.log(err);
    }
})*/


app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "https://meow-web.herokuapp.com/success",
          "cancel_url": "https://meow-web.herokuapp.com/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Lootbox",
                  "sku": "001",
                  "price": "2.99",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "2.99"
          },
          "description": "Lootbox!"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });


app.get('/success', requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({userID:(req.oidc.user.sub).substring(15, 34)});
    console.log(userProfile)
    const coins = userProfile.coins
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "2.99"
          }
      }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          if(userProfile.payments.includes(payment.id)){
            console.log('helloo')
            return res.redirect('/tokens');
          } else{
            console.log(userProfile.payments);
            userProfile.payments.push(payment.id);
            userProfile.coins = coins + 50000;
            userProfile.save();
            console.log(JSON.stringify(payment));
            return res.redirect('/tokens');
          }
          
      }
    });

});
//http://localhost:3000/success?paymentId=PAYID-MCTGALA8RU97999DG733233M&token=EC-2S019337SL9149211&PayerID=SVRZHYJRDPUJ8
/*requiresAuth(),*/
app.get('/tokens',requiresAuth(), async (req, res) => {
    //const userProfile = await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {});
    //await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {coins: userProfile.coins + 10000});
    try{
        res.render('tokens');
    } catch(err){
        console.log(err);
    }
})
/*
app.get('/tokens', (req, res) => {
    res.render('tokens')
})

app.get('*', (req, res) => {
    res.render('404', {
        title: 'NO WORDS....',
        message: 'HOPELESSLY LOST'
    })
})
*/

app.listen(port, () => {
    console.log('server running port' + port)
})