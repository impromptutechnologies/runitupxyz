const os = require("os");
const cluster = require("cluster");
const { promisify } = require("util");
if (cluster.isMaster) {
  const n_cpus = os.cpus().length;
  console.log(`${n_cpus} are being forked.`);
  for (let i = 0; i < 1; i++) {
    cluster.fork();
  }
} else {

  const express = require("express");
  require("dotenv").config();
  const moment = require("moment-timezone");
  require("./db/mongoose");
  const path = require("path");
  const hbs = require("hbs");
  const Profile = require("./models/profileSchema");
  const Outcome = require("./models/outcomeSchema");
  const Bet = require("./models/betSchema");
  const Invest = require("./models/investSchema");
  const Casino = require("./models/casinoSchema");
  const Stock = require("./models/stockSchema.js");
  const Prem = require("./models/premSchema.js");
  const Withdraw = require("./models/withdrawSchema.js");
  const WAValidator = require("wallet-address-validator");

  const Crypto = require("./models/cryptoSchema.js");
  var compression = require("compression");
  const { auth } = require("express-openid-connect");
  const { requiresAuth } = require("express-openid-connect");
  const paypal = require("paypal-rest-sdk");
  const dirname = __dirname;

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: "a long, randomly-generated string stored in env",
    baseURL: "https://getmeow.gg/",
    clientID: "wwH72gzRvTZB6mgXqB60tnc9lgppWShC",
    issuerBaseURL: "https://meowbot.us.auth0.com",
  };

  paypal.configure({
    mode: "live", //sandbox or live
    //'client_id': 'AYGEOzs1ivvoOXqHhdoWWZc0KGLUdcZ-YehnqROBBBzzfGeUecNQOcHzbo7CCHnqEw_PNpovgmqhj_d_',
    //'client_secret': 'EAvzD2BzwmUqlTKHTMjDONvk_1CHqFQunsbk8TICaeq21jXBqFB0bkBVBvmwea7zR6uMtfUV6jwNQGlH'
    client_id:
      "AXNiXr4W1Na95IWXtOtd6HBTBXmT4hq8GG-t9DhdeTYFOtRoveoVDWUylWhK4GQg_7YfenJ5t4Ki2StI",
    client_secret:
      "EIt7FQhJhPjvStUB-tp-C8hrbxeerJuLjKEI9Tz_EJwMYDMDiULtq473bnn0HYjTzP_IdzeJwnMlSkOi",
  });
  const redis = require("redis");
    const client = redis.createClient(process.env.REDIS_URL);
    const GET_ASYNC = promisify(client.get).bind(client);
    const SET_ASYNC = promisify(client.set).bind(client);

  const app = express();
  const publicdirectory = path.join(dirname, "../public");
  const viewsPath = path.join(__dirname, "../templates");
  app.use(express.static(publicdirectory));
  app.use(auth(config));
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(compression());
  let setCache = function (req, res, next) {
    const period = 60 * 15;
    if (req.method == "GET") {
      res.set("Cache-control", `public, max-age=${period}`);
    } else {
      res.set("Cache-control", `no-store`);
    }
    next();
  };
  app.use(setCache);
  const port = process.env.PORT || 3000;
  const date = moment.utc().format("MM-DD HH:mm");
  app.set("view engine", "hbs");
  app.set("views", viewsPath); 

  hbs.registerHelper("substring", function (aString) {
    var theString = aString.substring(0, 5) + "...";
    return new hbs.SafeString(theString);
  });

  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/loaderio-f5eb4b9349534dcaf4b4faa8680b82be", (req, res) => {
    res.send("loaderio-f5eb4b9349534dcaf4b4faa8680b82be");
  });

  app.get("/callback", requiresAuth(), async (req, res) => {
    res.redirect("account");
  });
  //requiresAuth(),
  app.get("/account", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    });
    if (userProfile == null) {
      res.render("makeaccount", {
        profileImage: req.oidc.user.picture,
        username: req.oidc.user.name,
      });
    } else {
      const userBets = await Bet.find({
        creatorID: req.oidc.user.sub.substring(15, 34),
      }).lean();
      const userInvests = await Invest.find({
        creatorID: req.oidc.user.sub.substring(15, 34),
      }).lean();
      const userWithdraws = await Withdraw.find({
        userID: req.oidc.user.sub.substring(15, 34),
      }).lean();
      res.render("account", {
        userWithdraws: userWithdraws,
        userBets: userBets,
        userInvests: userInvests,
        id: userProfile.userID,
        profileImage: req.oidc.user.picture,
        username: req.oidc.user.name,
        coins: Math.round(userProfile.coins, 2),
      });
    }
  });

  app.post("/auth/withdraw", requiresAuth(), async (req, res) => {
    const coins = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    }).lean();
    const validbtc = WAValidator.validate(req.body.address, "BTC");
    const valideth = WAValidator.validate(req.body.address, "ETH");
    if (valideth == true) {
      const coinUpdate = await Profile.findOneAndUpdate(
        { userID: req.oidc.user.sub.substring(15, 34) },
        { coins: parseInt(coins.coins - req.body.tokens) }
      );
      const withdraw = await Withdraw.create({
        userID: req.oidc.user.sub.substring(15, 34),
        crypto: "ethereum",
        tokens: req.body.tokens,
        address: req.body.address,
      });
    }
    if (validbtc == true) {
      const coinUpdate = await Profile.findOneAndUpdate(
        { userID: req.oidc.user.sub.substring(15, 34) },
        { coins: parseInt(coins.coins - req.body.tokens) }
      );
      const withdraw = await Withdraw.create({
        userID: req.oidc.user.sub.substring(15, 34),
        crypto: "bitcoin",
        tokens: req.body.tokens,
        address: req.body.address,
      });
    }
    res.redirect("/account");
  });

  app.post("/auth/addodd", async (req, res) => {
    console.log(req.body.outcomeID, req.body.odd1, req.body.odd2);
    const update = await Outcome.findOneAndUpdate(
      { outcomeID: req.body.outcomeID },
      { "option1.0.odds": req.body.odd1, "option1.0.odds2": req.body.odd2 }
    );
    console.log(update);
    res.redirect("/adminpanel");
  });

  app.post("/auth/withdrawdelete", async (req, res) => {
    console.log(req.body.userID);
    const update = await Withdraw.deleteOne({ userID: req.body.userID });
    console.log(update);
    res.redirect("/adminpanel");
  });

  app.post("/auth/timestart", async (req, res) => {
    const update = await Outcome.findOneAndUpdate(
      { outcomeID: req.body.outcomeID },
      { timeStart: req.body.timeStart, timeEnd: req.body.timeEnd }
    );
    console.log(update);
    res.redirect("/adminpanel");
  });

  app.post("/auth/changestock", async (req, res) => {
    const update = await Stock.findOneAndUpdate(
      { ticker: req.body.tickerorg },
      { ticker: req.body.tickernew, company: req.body.company }
    );
    console.log(update);
    res.redirect("/adminpanel");
  });

  app.post("/auth/changecrypto", async (req, res) => {
    const update = await Crypto.findOneAndUpdate(
      { symbol: req.body.symbolorg },
      { symbol: req.body.symbolnew, Crypto: req.body.crypto }
    );
    console.log(update);
    res.redirect("/adminpanel");
  });

  app.get("/adminpanel", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
    ) {
      console.log("hello");
      const outcomesc = await Outcome.find({
        category: "esportscod",
        timeStart: { $gt: date },
        "option1.0.odds": 0,
      })
        .sort({ timeStart: 1 })
        .lean();
      const outcomesd = await Outcome.find({
        category: "esportsdota",
        timeStart: { $gt: date },
        "option1.0.odds": 0,
      })
        .sort({ timeStart: 1 })
        .lean();
      const outcomesgo = await Outcome.find({
        category: "esportscsgo",
        timeStart: { $gt: date },
        "option1.0.odds": 0,
      })
        .sort({ timeStart: 1 })
        .lean();
      const outcomeslol = await Outcome.find({
        category: "esportslol",
        timeStart: { $gt: date },
        "option1.0.odds": 0,
      })
        .sort({ timeStart: 1 })
        .lean();
      const basketball = await Outcome.find({
        category: "basketball",
        timeStart: { $regex: ".*20:00.*" },
      }).lean();
      const userWithdraws = await Withdraw.find({}).lean();
      const stocks = await Stock.find({}).lean();
      const cryptos = await Crypto.find({}).lean();
      res.render("adminpanel", {
        stocks: stocks,
        cryptos: cryptos,
        outcomes: outcomesc,
        outcomesd: outcomesd,
        outcomesgo: outcomesgo,
        outcomeslol: outcomeslol,
        basketball: basketball,
        withdrawals: userWithdraws,
      });
    } else {
      console.log("no can do");
      res.redirect("/");
    }
  });

  app.get("", (req, res) => {
    res.render("index");
  });

  app.get("/testing", (req, res) => {
    res.send("testing");
  });

  app.get("/about", (req, res) => {
    res.render("about");
  });

  app.get("/arena", (req, res) => {
    res.render("arena");
  });

  app.get("/privacyterm", (req, res) => {
    res.render("privacyterms");
  });

  app.get("/bets", async (req, res) => {
    try {
        const reply = await GET_ASYNC('bets');
        if(reply){
            console.log(reply)
            res.render("bet", { outcomes: JSON.parse(reply)});
            return;
        }
      const outcomes = await Outcome.find({
        category: "soccer",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .lean()
        .limit(10);
        const saveResult = await SET_ASYNC('bets', JSON.stringify(outcomes), 'EX', 3600)
      res.render("bet", { outcomes: outcomes });
      //const outcomese = await Outcome.find({league: 'euros', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesp = await Outcome.find({league: 'prem', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesi = await Outcome.find({league: 'rest', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesc = await Outcome.find({league: 'champ', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //res.render('bet', {outcomes:outcomesp, outcomesi:outcomesi, outcomesc:outcomesc, outcomese:outcomese});
    } catch (err) {
      console.log(err);
    }
  });


  app.get("/betsbb", async (req, res) => {
    try {
        const reply = await GET_ASYNC('betsbb');
        if(reply){
            console.log(reply)
            res.render("betbasketball", { outcomes: JSON.parse(reply)});
            return;
        }
      const outcomes = await Outcome.find({
        category: "basketball",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult = await SET_ASYNC('betsbb', JSON.stringify(outcomes), 'EX', 3600)
      res.render("betbasketball", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsg", async (req, res) => {
    try {
        const outcomesc1 = await GET_ASYNC('outcomesc');
        const outcomesd1 = await GET_ASYNC('outcomesd');
        const outcomesgo1 = await GET_ASYNC('outcomesgo');
        const outcomeslol1 = await GET_ASYNC('outcomeslol');
        if(outcomesc1 || outcomesd1 || outcomesgo1 || outcomeslol1){
            res.render("betgame", {
                outcomes: JSON.parse(outcomesc1),
                outcomesd: JSON.parse(outcomesd1),
                outcomesgo: JSON.parse(outcomesgo1),
                outcomeslol: JSON.parse(outcomeslol1),
              });
            return;
        }
      const outcomesc = await Outcome.find({
        category: "esportscod",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult = await SET_ASYNC('outcomesc', JSON.stringify(outcomesc), 'EX', 3600)
      const outcomesd = await Outcome.find({
        category: "esportsdota",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult1 = await SET_ASYNC('outcomesd', JSON.stringify(outcomesd), 'EX', 3600)
      const outcomesgo = await Outcome.find({
        category: "esportscsgo",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult2 = await SET_ASYNC('outcomesgo', JSON.stringify(outcomesgo), 'EX', 3600)
      const outcomeslol = await Outcome.find({
        category: "esportslol",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult3 = await SET_ASYNC('outcomeslol', JSON.stringify(outcomeslol), 'EX', 3600)
      res.render("betgame", {
        outcomes: outcomesc,
        outcomesd: outcomesd,
        outcomesgo: outcomesgo,
        outcomeslol: outcomeslol,
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betscr", async (req, res) => {
    try {
        const reply = await GET_ASYNC('betscr');
        if(reply){
            console.log(reply)
            res.render("betcrypto", {
                outcomes: JSON.parse(reply),
                time2: "13:30",
                time1: "20:00",
              });
            return;
        }
      const outcomes = await Crypto.find({})
        .select({ Crypto: 1, symbol: 1 })
        .lean();
        const saveResult = await SET_ASYNC('betscr', JSON.stringify(outcomes), 'EX', 10000)
      res.render("betcrypto", {
        outcomes: outcomes,
        time2: "13:30",
        time1: "20:00",
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsst", async (req, res) => {
    try {
        
        const reply = await GET_ASYNC('betsst');
        if(reply){
            console.log(reply)
            res.render("betstock", {
                outcomes: JSON.parse(reply),
                time2: "13:30",
                time1: "20:00",
              });
            return;
        }
      const outcomes = await Stock.find({})
        .select({ company: 1, ticker: 1 })
        .lean();
        const saveResult = await SET_ASYNC('betsst', JSON.stringify(outcomes), 'EX', 10000)
      res.render("betstock", {
        outcomes: outcomes,
        time2: "13:30",
        time1: "20:00",
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/casino", async (req, res) => {
    try {
        const reply = await GET_ASYNC('casino');
        if(reply){
            console.log(reply)
            res.render("betcasino", { outcomes: JSON.parse(reply) });
            return;
        }
      const casinoCommands = await Casino.find({})
        .select({ description: 1, command: 1 })
        .lean();
        const saveResult = await SET_ASYNC('casino', JSON.stringify(casinoCommands), 'EX', 10000)
      res.render("betcasino", { outcomes: casinoCommands });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsq", async (req, res) => {
    try {
        const reply = await GET_ASYNC('betsq');
        if(reply){
            console.log(reply)
            res.render("betrandom", { outcomes: JSON.parse(reply) });
            return;
        }
      const outcomes = await Outcome.find({
        category: "random",
        timeStart: { $gt: date },
      })
        .sort({ timeStart: 1 })
        .lean();
        const saveResult = await SET_ASYNC('betsq', JSON.stringify(outcomes), 'EX', 10000)
      res.render("betrandom", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/pay", (req, res) => {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://getmeow.gg/success",
        cancel_url: "https://getmeow.gg/cancel",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Lootbox",
                sku: "001",
                price: "2.99",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "2.99",
          },
          description: "Lootbox!",
        },
      ],
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  });

  app.get("/success", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    });
    const coins = userProfile.coins;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "2.99",
          },
        },
      ],
    };
    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          throw error;
        } else {
          if (userProfile.payments.includes(payment.id)) {
            return res.redirect("/tokens");
          } else {
            userProfile.payments.push(payment.id);
            userProfile.coins = coins + 17645;
            userProfile.save();
            return res.redirect("/tokens");
          }
        }
      }
    );
  });


  app.get("/tokens", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
        userID: req.oidc.user.sub.substring(15, 34),
    });
    if (userProfile == null) {
        res.redirect("account");
    } else {
      res.render("tokens");
    }

  });




  app.get("*", (req, res) => {
    res.render("404");
  });

  app.listen(port, () => {
    console.log("server running port" + port);
  });
}






















/*
  //TEST ROUTES
  
app.get('/acctest', async (req, res) => {
    console.time('started1')
    const userProfile = await Profile.findOne({userID:'834304396673679411'});
    if (userProfile == null){
        res.render('makeaccount');
        
    }else{
        
        const userBets = await Bet.find({creatorID:'834304396673679411'}).select({ Code : 1 , betOdds : 1 , betAmount : 1}).sort({outcomeID:1}).lean().limit(10);
        const userInvests = await Invest.find({creatorID:'834304396673679411'}).select({ Code : 1 , investAmount : 1}).lean().sort({outcomeID:1}).limit(10);
        const userWithdraws = await Withdraw.find({userID:'834304396673679411'}).select({ tokens : 1 , crypto : 1 , address : 1}).sort({outcomeID:1}).lean().limit(1);
       
       
        res.render('account', {userWithdraws:userWithdraws, userBets: userBets, userInvests: userInvests, id: userProfile.userID, coins: Math.round(userProfile.coins, 2)});
    }
    console.timeEnd('started1')
})

app.get("/betstest2", async (req, res) => {
    try {
    console.time('started1')
      const outcomes = await Outcome.find({
        category: "soccer",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .lean()
        .limit(10);
    console.timeEnd('started1')
      res.render("bet", { outcomes: outcomes });
      //const outcomese = await Outcome.find({league: 'euros', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesp = await Outcome.find({league: 'prem', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesi = await Outcome.find({league: 'rest', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesc = await Outcome.find({league: 'champ', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //res.render('bet', {outcomes:outcomesp, outcomesi:outcomesi, outcomesc:outcomesc, outcomese:outcomese});
    } catch (err) {
      console.log(err);
    }
  });

app.get('/betstest', async (req, res) => {
    console.time('started')
    var date = moment.utc().format("MM-DD HH:mm");
    try{
        const outcomesc = await Outcome.find({category:"esportscod", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1}).lean();
        const outcomesd = await Outcome.find({category:"esportsdota", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1}).lean();
        const outcomesgo = await Outcome.find({category:"esportscsgo", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1}).lean();
        const outcomeslol = await Outcome.find({category:"esportslol", timeStart: { $gt: date }, 'option1.0.odds':{ $gt: 0 }}).sort({timeStart:1}).lean();
        res.render('betgame', {outcomes:outcomesc, outcomesd:outcomesd, outcomesgo:outcomesgo, outcomeslol:outcomeslol});
    } catch(err){
        console.log(err);
    }
    console.timeEnd('started')
})

//USING CACHING
app.get("/betstest", async (req, res) => {
    try {
        const reply = await GET_ASYNC('betstest');
        if(reply){
            console.log(reply)
            res.render("bet", { outcomes: JSON.parse(reply)});
            return;
        }
        console.timeEnd('fast')
      const outcomes = await Outcome.find({
        category: "soccer",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .lean()
        .limit(10);
        const saveResult = await SET_ASYNC('betstest', JSON.stringify(outcomes), 'EX', 60)
        console.log('newdata', saveResult)
      res.render("bet", { outcomes: outcomes });
      //const outcomese = await Outcome.find({league: 'euros', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesp = await Outcome.find({league: 'prem', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesi = await Outcome.find({league: 'rest', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //const outcomesc = await Outcome.find({league: 'champ', timeStart: { $gt: date }}, { team1 : 1 , team2 : 1 , timeStart : 1 , option1 : 1}).sort({timeStart:1}).lean().limit(10)
      //res.render('bet', {outcomes:outcomesp, outcomesi:outcomesi, outcomesc:outcomesc, outcomese:outcomese});
    } catch (err) {
      console.log(err);
    }
  });
*/