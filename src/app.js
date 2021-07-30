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
  /*const Prem = require("./models/premSchema.js");*/
  const Withdraw = require("./models/withdrawSchema.js");
  const WAValidator = require("wallet-address-validator");
  const completePayment = require('./queues/payment');

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
  const date2 = moment.utc().add(2, "days").format("MM-DD HH:mm");

  app.set("view engine", "hbs");
  app.set("views", viewsPath);

  hbs.registerHelper("substring", function (aString) {
    var theString = aString.substring(0, 5) + "...";
    return new hbs.SafeString(theString);
  });

  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/loaderio-0c92a1af2f19747dbea92f18a189898a", (req, res) => {
    res.send("loaderio-0c92a1af2f19747dbea92f18a189898a");
  });

  app.get("/callback", requiresAuth(), async (req, res) => {
    res.redirect("account");
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
        username: req.oidc.user.name,
      });
    } else {
      const userBets = await Bet.find({
        creatorID: req.oidc.user.sub.substring(15, 34),
      })
        .sort({ creatorID: 1 })
        .select({ Code: 1, betOdds: 1, betAmount: 1 })
        .lean()
        .limit(5);
      const userInvests = await Invest.find({
        creatorID: req.oidc.user.sub.substring(15, 34),
      })
        .sort({ creatorID: 1 })
        .select({ Code: 1, investAmount: 1 })
        .lean()
        .limit(5);
      const userWithdraws = await Withdraw.find({
        userID: req.oidc.user.sub.substring(15, 34),
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
        res.render("account", {
          userWithdraws: userWithdraws,
          userBets: userBets,
          userInvests: userInvests,
          id: userProfile.userID,
          profileImage: req.oidc.user.picture,
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
      } */
        res.render("account", {
          userWithdraws: userWithdraws,
          userBets: userBets,
          userInvests: userInvests,
          id: userProfile.userID,
          profileImage: req.oidc.user.picture,
          username: userProfile.username,
          return: Math.round(userR, 2),
          tokens: Math.round(userProfile.tokens, 2),
          color: "rgb(12, 212, 99)",
        });
      }
    }
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
    if (WAValidator.validate(req.body.address, "BTC") == true) {
      const coinUpdate = await Profile.findOneAndUpdate(
        { userID: req.oidc.user.sub.substring(15, 34) },
        { tokens: parseInt(tokens.tokens - req.body.tokens) }
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
  
  app.get("/callback", requiresAuth(), async (req, res) => {
    res.redirect("account");
  });

  //ACCOUNT

  //ADMIN PANEL
  app.post("/auth/addodd", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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

  app.post("/auth/withdrawdelete", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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

  app.post("/auth/randomResult", requiresAuth(), async (req, resp) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
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

  app.post("/auth/newRandom", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
    ) {
      Outcome.create(
        {
          outcomeID: 000001,
          category: "random",
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
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
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
      res.redirect("/adminpanel");
    } else {
      res.redirect("/adminpanel");
    }
  });

  app.get("/adminpanel", requiresAuth(), async (req, res) => {
    if (
      req.oidc.user.sub.substring(15, 34) == "450122601314910208" ||
      req.oidc.user.sub.substring(15, 34) == "834304396673679411"
    ) {
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
        $or: [{ timeStart: { $regex: ".*20:00.*" } }, { option1: [] }],
      }).lean();
      const userWithdraws = await Withdraw.find({})
        .select({ crypto: 1, tokens: 1, address: 1 })
        .lean();
      const ongoing = await Outcome.find({ timeStart: { $lt: date } })
        .select({ outcomeID: 1, team1: 1, team2: 1 })
        .lean();
      const stocks = await Stock.find({})
        .select({ ticker: 1, company: 1 })
        .lean();
      const cryptos = await Crypto.find({})
        .select({ symbol: 1, Crypto: 1 })
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
        stocks: stocks,
        cryptos: cryptos,
        outcomes: outcomesc,
        outcomesd: outcomesd,
        usercount: usercount,
        paidusers: paidusers,
        revenues: revenuesmin,
        betcount: betcount,
        investcount: investcount,
        outcomesgo: outcomesgo,
        outcomeslol: outcomeslol,
        basketball: basketball,
        randoms: randoms,
        ongoing: ongoing,
        withdrawals: userWithdraws,
      });
    } else {
      res.redirect("/");
    }
  });

  //ADMIN PANEL

  //MISC
  app.get("", (req, res) => {
    res.render("index");
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

  //MISC

  //BETS
  app.get("/bets", async (req, res) => {
    try {
      const reply = await GET_ASYNC("bets");
      if (reply) {
        res.render("bet", { outcomes: JSON.parse(reply) });
        return;
      }
      const outcomes = await Outcome.find({
        category: "soccer",
        timeStart: { $gt: date, $lt: date2 },
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

  app.get("/betsbb", async (req, res) => {
    try {
      const reply = await GET_ASYNC("betsbb");
      if (reply) {
        res.render("betbasketball", { outcomes: JSON.parse(reply) });
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

  app.get("/betscr", async (req, res) => {
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
        10000
      );
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
      const reply = await GET_ASYNC("betsst");
      if (reply) {
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
      const saveResult = await SET_ASYNC(
        "betsst",
        JSON.stringify(outcomes),
        "EX",
        10000
      );
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
                price: "3.99",
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: "3.99",
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
  });




  app.get("/tokens",requiresAuth(), async (req, res) => {
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