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
  const getEthBalance = require("./utils/getEthBalance");
  const getBalance = require("./utils/getBalance");

  const transferEth = require("./utils/transferEth");
  const express = require("express");
  require("dotenv").config();
  const moment = require("moment-timezone");
  require("./db/mongoose");
  const path = require("path");
  const hbs = require("hbs");
  const stockPrice = require("./utils/stockprice");
  const Profile = require("./models/profileSchema");
  const Outcome = require("./models/outcomeSchema");
  const Bet = require("./models/betSchema");
  const Invest = require("./models/investSchema");
  const Casino = require("./models/casinoSchema");
  const Stock = require("./models/stockSchema.js");
  /*const Prem = require("./models/premSchema.js");*/
  const newMatchesSoccer = require("./utils/newmatches");
  const newMatchesBasketball = require("./utils/newmatchesb");
  const Withdraw = require("./models/withdrawSchema.js");
  const WAValidator = require("wallet-address-validator");
  const setReturns = require("./utils/setReturns");
  const winLoss = require("./utils/winLoss");

  const completePayment = require("./queues/payment");
  const createWallet = require("./utils/createWallet");
  const depositAddress = require("./utils/depositAddress");
  const updateBalance = require("./utils/updateBalance");
  const updateBalanceERC20 = require("./utils/updateBalanceERC20");
  const betResultInv = require("./utils/betResultInv");

  const deployToken = require("./utils/deployToken");
  const ethGas = require("./utils/ethGas");
  const { flash } = require('express-flash-message');

  const Crypto = require("./models/cryptoSchema.js");
  var compression = require("compression");
  const { auth } = require("express-openid-connect");
  const { requiresAuth } = require("express-openid-connect");
  const paypal = require("paypal-rest-sdk");
  const dirname = __dirname;
  const session = require('express-session');

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: "https://churro.gg/",
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: "https://meowbot.us.auth0.com",
  };

  paypal.configure({
    mode: "live", //sandbox or live
    //client_id: 'AYGEOzs1ivvoOXqHhdoWWZc0KGLUdcZ-YehnqROBBBzzfGeUecNQOcHzbo7CCHnqEw_PNpovgmqhj_d_',
    //client_secret: 'EAvzD2BzwmUqlTKHTMjDONvk_1CHqFQunsbk8TICaeq21jXBqFB0bkBVBvmwea7zR6uMtfUV6jwNQGlH'
    client_id: process.env.CLIENT_IDPYPL,
    client_secret: process.env.CLIENT_SECRET,
  });

  const redis = require("redis");
  const client = redis.createClient(process.env.REDIS_URL);
  const stocks = require('stock-ticker-symbol');

  client.on("error", function (err) {
    console.log("Error " + err);
  });

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

  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        // secure: true, // becareful set this option, check here: https://www.npmjs.com/package/express-session#cookiesecure. In local, if you set this to true, you won't receive flash as you are using `http` in local, but http is not secure
      },
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
  hbs.registerHelper("ifCond", function (v1, options) {
    if (v1 === "won") {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  app.use(setCache);
  const port = process.env.PORT || 3000;

  const date = moment.utc().format("MM-DD HH:mm");
  const date2 = moment.utc().add(2, "days").format("MM-DD HH:mm");

  app.set("view engine", "hbs");
  app.set("views", viewsPath);

  hbs.registerHelper("substring", function (aString) {
    var theString = aString.substring(0, 5) + "...";
    return new hbs.SafeString(theString);
  });
  app.use(flash({ sessionKeyName: 'flashMessage' }));

  app.get("/", async (req, res) => {
    const invests = await Invest.find({})
      .sort({ creatorID: 1 })
      .select({ Code: 1, investAmount: 1, creatorName: 1, dayWeek: 1 })
      .lean()
      .limit(5);
    const messages = await req.consumeFlash('info');
    console.log(messages)
    res.render("index", { invests, messages });
  });

  app.get("/getethbaale", async (req, res) => {
    getBalance("61f1e3a3763de95164f215f5", (data) => {
      console.log(data);
    });
    res.render("index");
  });

  app.get("/loaderio-0c92a1af2f19747dbea92f18a189898a", (req, res) => {
    res.send("loaderio-0c92a1af2f19747dbea92f18a189898a");
  });

  app.get("/callback", requiresAuth(), async (req, res) => {
    res.redirect("account");
  });



  app.post("/auth/enter", async (req, res) => {
    const user = await Profile.findOne({
      userID: '834304396673679411'
    })
    
      .sort({ userID: 1 })
      .lean();
      
    var day = moment.utc().format("DD");
    var month = moment.utc().format("MM");
    var date = moment.utc().format("MM-DD HH:mm");
    var date1 = moment.utc().format(`${month}-${day} 13:30`);
    var date2 = moment.utc().format(`${month}-${day} 21:35`);
    var today = new Date();
    const amt = 100
    /*if (
      date > date1 &&
      date < date2 &&
      today.getDay() !== 6 &&
      today.getDay() !== 0
    ) {
      await req.flash('info', 'Market Open!');
      return res.redirect('/about')
    }*/
    console.log(stocks.lookup(req.body.code))
    if(stocks.lookup(req.body.code) == null) { // returns TRUE
      await req.flash('info', 'Is the ticker correct?');
      return res.redirect('/')
    }else{
      const prof = await Profile.findOneAndUpdate(
        { userID: '834304396673679411', },
        { $inc: { tokens: -amt } }
      );
      console.log(prof)
      Invest.create(
        {
          creatorID: '834304396673679411',
          serverID: 'web',
          channelID: 'web',
          category: "stocks",
          creatorName: prof.username,
          status: "open",
          investAmount: amt,
          Code: req.body.code,
        },
        (err, res) => {
          if (err) {
            return console.log(err);
          }
          res.save();
        }
        
      );
      return res.redirect("/account");
    }

    /*profileData.tokens = profileData.tokens - amt;
                  profileData.bettokens = profileData.bettokens + amt;
                  profileData.save();*/
    

  });






  //ACCOUNT
  app.get("/account", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    })
      .sort({ userID: 1 })
      .lean();
    if (userProfile == null) {
      res.render("makeaccount", {
        profileImage: req.oidc.user.picture,
        username: "Create Your Account!",
      });
    }

    const userInvests = await Invest.find({
      creatorID: req.oidc.user.sub.substring(15, 34),
    })
      .sort({ creatorID: 1 })
      .select({ Code: 1, investAmount: 1, status: 1, dayWeek: 1 })
      .lean()
      .limit(5);
    console.log(userInvests);
    const userWithdraws = await Withdraw.find({
      userID: req.oidc.user.sub.substring(15, 34),
    })
      .sort({ userID: 1 })
      .select({ tokens: 1, crypto: 1, address: 1 })
      .lean()
      .limit(5);

    return res.render("account", {
      userWithdraws: userWithdraws,
      userInvests: userInvests,
      id: userProfile.userID,
      profileImage: req.oidc.user.picture,
      username: userProfile.username,
      depositAddr: userProfile.depositAddress,
      tokens: Math.round(userProfile.tokens, 2),
    });
  });

  app.get("/account2", async (req, res) => {
    const userProfile = await Profile.findOne({
      //userID: req.oidc.user.sub.substring(15, 34),
      userID: "834304396673679411",
    })
      .sort({ userID: 1 })
      .lean();
    if (userProfile == null) {
      res.render("makeaccount", {
        //profileImage: req.oidc.user.picture,
        username: "ChurroChurroChurro#3479",
      });
    } else {
      const userBets = await Bet.find({
        creatorID: "834304396673679411",
      })
        .sort({ creatorID: 1 })
        .select({ Code: 1, betOdds: 1, betAmount: 1 })
        .lean()
        .limit(5);
      const userInvests = await Invest.find({
        creatorID: "834304396673679411",
      })
        .sort({ creatorID: 1 })
        .select({ Code: 1, investAmount: 1, status: 1, dayWeek: 1 })
        .lean()
        .limit(5);
      const userWithdraws = await Withdraw.find({
        userID: "834304396673679411",
      })
        .sort({ userID: 1 })
        .select({ tokens: 1, crypto: 1, address: 1 })
        .lean()
        .limit(5);
      const userReturn =
        ((userProfile.returntokens - userProfile.bettokens) /
          userProfile.bettokens) *
        100;
      const userR = userReturn || 0;
      if (userReturn < 0) {
        res.render("account2", {
          userWithdraws: userWithdraws,
          userBets: userBets,
          userInvests: userInvests,
          id: userProfile.userID,
          //profileImage: req.oidc.user.picture,
          username: userProfile.username,
          return: Math.round(userR, 2),
          tokens: Math.round(userProfile.tokens, 2),
          color: "red",
        });
      } else {
        /*if(userReturn == 0){
        res.render("account", {
          userWithdraws: userWithdraws,
          userBets: userBets,
          userInvests: userInvests,
          id: userProfile.userID,
          profileImage: req.oidc.user.picture,
          username: userProfile.username,
          return: Math.round(userR, 2),
          tokens: Math.round(userProfile.tokens, 2),
          color: 'grey'
        });
      }*/
        res.render("account2", {
          userWithdraws: userWithdraws,
          userBets: userBets,
          userInvests: userInvests,
          id: userProfile.userID,
          //profileImage: req.oidc.user.picture,
          username: userProfile.username,
          return: Math.round(userR, 2),
          depositAddress: userProfile.depositAddress,
          tokens: Math.round(userProfile.tokens, 2),
          color: "rgb(12, 212, 99)",
        });
      }
    }
  });

  app.post("/auth/refreshBalance", async (req, res) => {
    const tokens = await Profile.findOne({
      userID: "870562004753072169",
    })
      .sort({ userID: 1 })
      .lean();
    updateBalance(req.body.address, tokens.cryptoBalance);
    res.redirect("/accounttest");
  });

  app.post("/auth/claim", requiresAuth(), async (req, res) => {
    const tokens = await Profile.findOneAndUpdate(
      { userID: req.oidc.user.sub.substring(15, 34) },
      {
        $inc: { tokens: 1000 },
      }
    );
    const deleted = await Invest.findOneAndDelete({
      creatorID: req.oidc.user.sub.substring(15, 34),
      Code: req.body.code,
    });
    res.redirect("/account");
  });

  app.post("/auth/refreshBalance1", async (req, res) => {
    const tokens = await Profile.findOne({
      userID: "870562004753072169",
    })
      .sort({ userID: 1 })
      .lean();
    updateBalanceERC20(req.body.address);
    res.redirect("/accounttest");
  });

  app.post("/auth/register", async (req, res) => {
    let profile = await Profile.create({
      userID: req.body.email,
      depositAddress: req.body.depositAddress,
      externalID: "",
      tokens: 1000,
    });
    profile.save();
    res.redirect("/accounttest");
  });

  app.post("/auth/withdraw", requiresAuth(), async (req, res) => {
    const tokens = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    })
      .sort({ userID: 1 })
      .lean();
    if (WAValidator.validate(req.body.address, "ETH") == true) {
      const coinUpdate = await Profile.findOneAndUpdate(
        { userID: req.oidc.user.sub.substring(15, 34) },
        { tokens: parseInt(tokens.tokens - req.body.tokens) }
      );
      const withdraw = await Withdraw.create({
        userID: req.oidc.user.sub.substring(15, 34),
        crypto: "ethereum",
        tokens: req.body.tokens,
        address: req.body.address,
      });
    }
    res.redirect("/account");
  });

  app.get("/callback", requiresAuth(), async (req, res) => {
    res.redirect("account");
  });

  //ACCOUNT
  //ADMIN PANEL
  app.post("/auth/addodd", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Outcome.findOneAndUpdate(
        { outcomeID: req.body.outcomeID },
        { "option1.0.odds": req.body.odd1, "option1.0.odds2": req.body.odd2 }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/addoddsoc", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Outcome.findOneAndUpdate(
        { outcomeID: req.body.outcomeID },
        {
          "option1.0.odds": req.body.odd1,
          "option1.0.odds2": req.body.odd2,
          "option1.0.odds3": req.body.odd3,
        }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/withdrawdelete", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Withdraw.deleteOne({ userID: req.body.userID });
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/timestart", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Outcome.findOneAndUpdate(
        { outcomeID: req.body.outcomeID },
        { timeStart: req.body.timeStart, timeEnd: req.body.timeEnd }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/changestock", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Stock.findOneAndUpdate(
        { ticker: req.body.tickerorg },
        { ticker: req.body.tickernew, company: req.body.company }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/changecrypto", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      const update = await Crypto.findOneAndUpdate(
        { symbol: req.body.symbolorg },
        { symbol: req.body.symbolnew, Crypto: req.body.crypto }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/randomResult", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      Outcome.findOneAndDelete(
        {
          category: "random",
          $or: [
            { "option1.0.Code": req.body.winner },
            { "option1.0.Code2": req.body.winner },
          ],
        },
        (err, res) => {
          if (err) {
            console.log(err);
          }
          const Code1 = res.option1[0].Code;
          const Code2 = res.option1[0].Code2;
          if (req.body.winner == Code1) {
            Bet.updateMany(
              { Code: req.body.winner },
              { status: "won" },
              (err, res) => {
                if (err) {
                  console.log(err);
                }
              }
            );
            Bet.deleteMany(
              {
                Code: Code2,
              },
              (error, deleted) => {
                if (error) {
                  console.log(error);
                }
              }
            );
            resp.redirect("/adminpanel");
          }
          if (req.body.winner == Code2) {
            Bet.updateMany(
              { Code: req.body.winner },
              { status: "won" },
              (err, res) => {
                if (err) {
                  console.log(err);
                }
              }
            );
            Bet.deleteMany(
              {
                Code: Code1,
              },
              (error, deleted) => {
                if (error) {
                  console.log(error);
                }
              }
            );
            resp.redirect("/adminpanel");
          }
        }
      );
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/newOther", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      Outcome.create(
        {
          outcomeID: req.body.outcomeID,
          category: req.body.category,
          desc: req.body.desc,
          team1: req.body.choiceOne,
          team2: req.body.choiceTwo,
          timeStart: req.body.timeStart,
          timeEnd: req.body.timeEnd,
        },
        (err, res) => {
          console.log(res);
          if (err) {
            console.log(err);
          }
          const Code = req.body.Code;
          const odds = req.body.odds;
          const Code2 = req.body.Code2;
          const odds2 = req.body.odds2;
          res.addOptions([Code, odds, Code2, odds2]);
          res.save();
        }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });
  app.post("/auth/addBB", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "870562004753072169" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
    ) {
      Outcome.findOne(
        {
          outcomeID: req.body.outcomeID,
        },
        (err, res) => {
          console.log(res);
          if (err) {
            console.log(err);
          }
          const Code = req.body.Code;
          const odds = req.body.odds;
          const Code2 = req.body.Code2;
          const odds2 = req.body.odds2;
          res.addOptions([Code, odds, Code2, odds2]);
          res.save();
        }
      );
      return res.redirect("/adminpanel");
    } else {
      return res.redirect("/adminpanel");
    }
  });

  app.post("/auth/addSoc", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "870562004753072169" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
    ) {
      Outcome.findOne(
        {
          outcomeID: req.body.outcomeID,
        },
        (err, res) => {
          console.log(res);
          if (err) {
            console.log(err);
          }
          const Code = req.body.Code;
          const odds = req.body.odds;
          const Code2 = req.body.Code2;
          const odds2 = req.body.odds2;
          const Code3 = req.body.Code2;
          const odds3 = req.body.odds2;
          res.addOptions([Code, odds, Code2, odds2, Code3, odds3]);
          res.save();
        }
      );
      return res.redirect("/adminpanel");
    } else {
      return res.redirect("/adminpanel");
    }
  });
  //, requiresAuth()//req.oidc.user.sub.substring(15, 34), requiresAuth()requiresAuth(),
  app.get("/adminpanel", requiresAuth(), async (req, res) => {
    if ("870562004753072169" == "870562004753072169") {
      console.log("ey");
      const basketball = await Outcome.find({
        category: "basketball",
        $or: [{ timeStart: { $regex: ".*20:00.*" } }, { option1: [] }],
      }).lean();
      const userWithdraws = await Withdraw.find({})
        .select({ crypto: 1, tokens: 1, address: 1 })
        .lean();
      const ongoing = await Outcome.find({})
        .select({ outcomeID: 1, team1: 1, team2: 1 })
        .lean();
      const ongoing1 = await Outcome.find({ option1: [] })
        .select({ outcomeID: 1, team1: 1, team2: 1 })
        .lean();
      const stocks = await Stock.find({})
        .select({ ticker: 1, company: 1 })
        .lean();
      const usercount = await Profile.count({}).lean();
      const paidusers = await Profile.count({ payments: { $ne: [] } }).lean();
      const revenuesmin = paidusers * 2.5;
      const betcount = await Bet.count({}).lean();
      const investcount = await Invest.count({}).lean();
      const randoms = await Outcome.find({
        category: "random",
      })
        .sort({ timeStart: 1 })
        .select({ Code: 1, Code2: 1 })
        .lean();

      res.render("adminpanel", {
        usercount: usercount,
        paidusers: paidusers,
        revenues: revenuesmin,
        betcount: betcount,
        investcount: investcount,
        basketball: basketball,
        randoms: randoms,
        ongoing: ongoing,
        ongoing1: ongoing1,
        withdrawals: userWithdraws,
        stocks: stocks,
      });
    } else {
      res.redirect("/");
    }
  });

  app.post("/auth/newMatch", requiresAuth(), async (req, res) => {
    if (
      /*req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"*/
      1 == 1
    ) {
      Outcome.create(
        {
          outcomeID: req.body.outcomeID,
          league: req.body.league,
          category: req.body.category,
          desc: req.body.desc,
          team1: req.body.choiceOne,
          team2: req.body.choiceTwo,
          timeStart: req.body.timeStart,
          timeEnd: req.body.timeEnd,
        },
        (err, res) => {
          console.log(res);
          if (err) {
            console.log(err);
          }
          const Code = req.body.Code;
          const odds = req.body.odds;
          const Code2 = req.body.Code2;
          const odds2 = req.body.odds2;
          const Code3 = req.body.Code3;
          const odds3 = req.body.odds4;
          res.addOptions([Code, odds, Code2, odds2, Code3, odds3]);
          res.save();
        }
      );
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.post("/auth/winningStock", async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "870562004753072169"
    ) {
      betResultInv(req.body.winner, "stocks");
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  //ADMIN PANEL
  app.get("/newsoccergames", requiresAuth(), async (req, res) => {
    if (req.oidc.user.sub.substring(15, 34) == "870562004753072169") {
      console.log("eh");
      newMatchesSoccer("prem");
      newMatchesSoccer("champ");
      newMatchesSoccer("seriea");
      newMatchesSoccer("bundes");
      newMatchesSoccer("laliga");
      return res.redirect("/bets");
    }
  });

  //ADMIN PANEL
  app.get("/dao", async (req, res) => {
    return res.render("arena");
  });

  //requiresAuth(),

  //requiresAuth(),
  app.get("/betresultinv", async (req, res) => {
    const highestcrypto = await Crypto.findOne({})
      .sort({ return: -1 })
      .limit(1);
    const higheststock = await Stock.findOne({}).sort({ return: -1 }).limit(1);

    betResultInv(higheststock.ticker, "stocks");
    betResultInv(highestcrypto.ticker, "crypto");
    return res.redirect("/");
    /*
        newMatchesBasketball("1");
    newMatchesBasketball("2");
    newMatchesBasketball("3");
    */
  });

  app.get("/newbasketballgames", requiresAuth(), async (req, res) => {
    console.log("eh");
    /*newMatchesSoccer('prem')
    newMatchesSoccer('champ')
    newMatchesSoccer('seriea')
    newMatchesSoccer('bundes')
    newMatchesSoccer('laliga')
    return res.redirect('/bets')
    /**/
    newMatchesBasketball("1");
    newMatchesBasketball("2");
    newMatchesBasketball("3");
    return res.redirect("/bets2");
  });

  //MISC

  app.get("", (req, res) => {
    res.render("index");
  });
  app.get("/about", async (req, res) => {
    const messages = await req.consumeFlash('info');
    console.log(messages)
    res.render("about", { messages });
  });

  app.get("/setRez", (req, res) => {
    setReturns();
    res.render("about");
  });

  app.get("/winLos", async (req, res) => {
    const investmentstock = await Invest.find({ category: "stocks" });
    winLoss((data) => {
      console.log(data);
      investmentstock.forEach(async (stock) => {
        console.log(stock.Code, stock.change, data);
        if (stock.change > data) {
          Invest.updateMany(
            { Code: stock.Code },
            { status: "won", percentile: data },
            (req, res) => {
              console.log(res);
            }
          );
        } else {
          Invest.deleteMany({ Code: stock.Code }, (req, res) => {
            console.log(res);
          });
        }
      });
    });
    res.render("about");
  });

  //requiresAuth(),
  app.get("/lootbox", requiresAuth(), (req, res) => {
    return res.render("tokens");
  });

  app.get("/arena", (req, res) => {
    res.render("arena");
  });
  app.get("/privacyterm", (req, res) => {
    res.render("privacyterms");
  });
  //MISC
  //BETS
  app.get("/bets", async (req, res) => {
    try {
      const reply = await GET_ASYNC("bets");
      if (reply) {
        res.render("bet", { outcomes: JSON.parse(reply) });
        return;
      }

      console.log("hello");
      const outcomes = await Outcome.find({
        category: "soccer",
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .lean()
        .limit(10);
      const saveResult = await SET_ASYNC(
        "bets",
        JSON.stringify(outcomes),
        "EX",
        3600
      );
      res.render("bet", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/bets2", async (req, res) => {
    try {
      console.log("hello");
      const outcomes = await Outcome.find({
        category: "soccer",
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .lean()
        .limit(10);
      res.render("bet", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsbb", async (req, res) => {
    try {
      const reply = await GET_ASYNC("betsbb");
      if (reply) {
        res.render("betbasketball", { outcomes: JSON.parse(reply) });
        return;
      }
      const outcomes = await Outcome.find({
        category: "basketball",
        //timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .select({ team1: 1, team2: 1, timeStart: 1, option1: 1 })
        .sort({ timeStart: 1 })
        .lean();
      const saveResult = await SET_ASYNC(
        "betsbb",
        JSON.stringify(outcomes),
        "EX",
        3600
      );
      res.render("betbasketball", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsg", async (req, res) => {
    try {
      const outcomesc1 = await GET_ASYNC("outcomesc");
      const outcomesd1 = await GET_ASYNC("outcomesd");
      const outcomesgo1 = await GET_ASYNC("outcomesgo");
      const outcomeslol1 = await GET_ASYNC("outcomeslol");
      if (outcomesc1 || outcomesd1 || outcomesgo1 || outcomeslol1) {
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
        .select({
          team1: 1,
          team2: 1,
          timeStart: 1,
          option1: 1,
          odds: 1,
          odds2: 1,
          Code: 1,
          Code2: 1,
        })
        .lean();
      const saveResult = await SET_ASYNC(
        "outcomesc",
        JSON.stringify(outcomesc),
        "EX",
        3600
      );
      const outcomesd = await Outcome.find({
        category: "esportsdota",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({
          team1: 1,
          team2: 1,
          timeStart: 1,
          option1: 1,
          odds: 1,
          odds2: 1,
          Code: 1,
          Code2: 1,
        })
        .lean();
      const saveResult1 = await SET_ASYNC(
        "outcomesd",
        JSON.stringify(outcomesd),
        "EX",
        3600
      );
      const outcomesgo = await Outcome.find({
        category: "esportscsgo",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({
          team1: 1,
          team2: 1,
          timeStart: 1,
          option1: 1,
          odds: 1,
          odds2: 1,
          Code: 1,
          Code2: 1,
        })
        .lean();
      const saveResult2 = await SET_ASYNC(
        "outcomesgo",
        JSON.stringify(outcomesgo),
        "EX",
        3600
      );

      const outcomeslol = await Outcome.find({
        category: "esportslol",
        timeStart: { $gt: date },
        "option1.0.odds": { $gt: 0 },
      })
        .sort({ timeStart: 1 })
        .select({
          team1: 1,
          team2: 1,
          timeStart: 1,
          option1: 1,
          odds: 1,
          odds2: 1,
          Code: 1,
          Code2: 1,
        })
        .lean();

      const saveResult3 = await SET_ASYNC(
        "outcomeslol",
        JSON.stringify(outcomeslol),
        "EX",
        3600
      );
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

  /*app.get("/betscr", async (req, res) => {
    try {
      const reply = await GET_ASYNC("betscr");
      if (reply) {
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
      const saveResult = await SET_ASYNC(
        "betscr",
        JSON.stringify(outcomes),
        "EX",
        3600
      );
      res.render("betcrypto", {
        outcomes: outcomes,
        time2: "13:30",
        time1: "21:35",
      });
    } catch (err) {
      console.log(err);
    }
  });*/

  app.get("/stockrace", async (req, res) => {
    try {
      /*const reply = await GET_ASYNC("betsst");
      if (reply) {
        res.render("betstock", {
          outcomes: JSON.parse(reply),
          time2: "13:30",
          time1: "20:00",
        });
        return;
      }*/
      /*const outcomes = await Stock.find({})
        .select({ company: 1, ticker: 1 })
        .lean();
      const saveResult = await SET_ASYNC(
        "betsst",
        JSON.stringify(outcomes),
        "EX",
        3600
      );*/
      res.render("betstock", {
        time2: "13:30",
        time1: "21:35",
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsst", async (req, res) => {
    try {
      /*const reply = await GET_ASYNC("betsst");
      if (reply) {
        res.render("betstock", {
          outcomes: JSON.parse(reply),
          time2: "13:30",
          time1: "20:00",
        });
        return;
      }*/
      const outcomes = await Stock.find({})
        .select({ company: 1, ticker: 1 })
        .lean();
      /*const saveResult = await SET_ASYNC(
        "betsst",
        JSON.stringify(outcomes),
        "EX",
        3600
      );*/
      res.render("betstockr", {
        time2: "13:30",
        time1: "21:35",
        outcomes,
      });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/casino", async (req, res) => {
    try {
      const reply = await GET_ASYNC("casino");
      if (reply) {
        res.render("betcasino", { outcomes: JSON.parse(reply) });
        return;
      }
      const casinoCommands = await Casino.find({})
        .select({ description: 1, command: 1 })
        .lean();
      const saveResult = await SET_ASYNC(
        "casino",
        JSON.stringify(casinoCommands),
        "EX",
        10000
      );
      res.render("betcasino", { outcomes: casinoCommands });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/betsq", async (req, res) => {
    try {
      const reply = await GET_ASYNC("betsq");
      if (reply) {
        res.render("betrandom", { outcomes: JSON.parse(reply) });
        return;
      }
      const outcomes = await Outcome.find({
        category: "random",
        timeStart: { $gt: date },
      })
        .sort({ timeStart: 1 })
        .select({
          team1: 1,
          team2: 1,
          timeStart: 1,
          odds: 1,
          odds2: 1,
          Code: 1,
          Code2: 1,
          desc: 1,
        })
        .lean();
      const saveResult = await SET_ASYNC(
        "betsq",
        JSON.stringify(outcomes),
        "EX",
        10000
      );

      res.render("betrandom", { outcomes: outcomes });
    } catch (err) {
      console.log(err);
    }
  });
  //BETS

  //PAY
  app.post("/pay", (req, res) => {
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: "https://churro.gg/success",
        cancel_url: "https://churro.gg/",
      },
      transactions: [
        {
          item_list: {
            items: [
              {
                name: "Lootbox",
                sku: "001",
                price: "5.99",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "5.99",
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
    console.log(req.oidc.user.sub.substring(15, 34), "hey");
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    });
    if (userProfile == null) {
      res.redirect("/makeaccount.hbs");
    } else {
      console.log(userProfile);
      const coins = userProfile.tokens;
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: "5.99",
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
              return res.redirect("/account");
            } else {
              userProfile.payments.push(payment.id);
              userProfile.tokens = coins + 6942;
              userProfile.save();
              return res.redirect("/account");
            }
          }
        }
      );
    }
  });

  /*app.get("/success", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    }).sort({ userID: 1 });
    const tokens = userProfile.tokens;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "3.99",
          },
        },
      ],
    };
    completePayment(req.oidc.user.sub.substring(15, 34), tokens, paymentId, execute_payment_json);
    return res.redirect("/account");
  });*/
  app.get("/betzeeee", async (req, res) => {
    await setReturns();
    return res.redirect("/");
  });

  app.get("/cuteze", async (req, res) => {
    const betStock = await Invest.find({});
    winLoss((data) => {
      console.log(data);
      betStock.forEach(async (stock) => {
        console.log(stock.Code, stock.change, data);
        if (stock.change > data) {
          Invest.updateMany(
            { Code: stock.Code },
            { status: "won", percentile: data },
            (req, res) => {
              console.log(res);
            }
          );
        } else {
          Invest.deleteMany({ Code: stock.Code }, (req, res) => {
            console.log(res);
          });
        }
      });
    });
    return res.redirect("/about");
  });

  app.get("x", requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: req.oidc.user.sub.substring(15, 34),
    })
      .sort({ userID: 1 })
      .lean();
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
            userProfile.tokens = tokens + 17645;
            userProfile.save();
            return res.redirect("/tokens");
          }
        }
      }
    );



  app.get("/jeez", async (req, res) => {
    const userProfile = await Profile.findOne({
      userID: '834304396673679411',
    }).sort({ userID: 1 });
    const tokens = userProfile.tokens;
    const payerId = 12323;
    const paymentId = 12312313;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: "3.99",
          },
        },
      ],
    };
    completePayment(userProfile, tokens, paymentId, execute_payment_json);
    res.redirect("about");
  });*/
