const express = require('express')
const path = require('path')
const hbs = require('hbs')
const Profile = require('./models/profileSchema')
const Outcome = require('./models/outcomeSchema')
const Casino = require('./models/casinoSchema')
const Stock = require('./models/stockSchema.js')
const Crypto = require('./models/cryptoSchema.js')
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://meow-web.herokuapp.com',
    clientID: 'w2CVpyrckqpgONLHBJydkIJOEc6W7GSS',
    issuerBaseURL: 'https://meowbot.us.auth0.com'
  };

const dirname = __dirname
require('./db/mongoose')
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



app.get('/', (req, res) => {
    //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
    res.render('index');
})

app.post('/callback', requiresAuth(), async (req, res) => {
    res.redirect('account')
})

app.get('/account', requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOne({userID:(req.oidc.user.sub).substring(15, 34)});
    res.render('account', {id: userProfile.userID, profileImage: req.oidc.user.picture, username: req.oidc.user.name, coins: Math.round(userProfile.coins, 2)});
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

app.get('/bets', async (req, res) => {
    try{
        var date = moment.utc().format("MM-DD HH:mm");
        const outcomes1 = await Outcome.aggregate([
            {
                $match: {
                    'category': 'soccer',
                    'timeStart': { $gt: date }
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
        res.render('bet', {outcomes:outcomes1});
    } catch(err){
        console.log(err);
    }
})

app.get('/betsbb', async (req, res) => {
    var date = moment.utc().format("MM-DD HH:mm");
    try{
        const outcomes = await Outcome.find({category:"basketball", timeStart: { $gt: date }}).sort({timeStart:1});
        res.render('betbasketball', {outcomes:outcomes});
    } catch(err){
        console.log(err);
    }
})

app.get('/betsg', async (req, res) => {
    var date = moment.utc().format("MM-DD HH:mm");
    try{
        const outcomesc = await Outcome.find({category:"esportscod", timeStart: { $gt: date }}).sort({timeStart:1});
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

app.get('/tokens',requiresAuth(), async (req, res) => {
    const userProfile = await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {});
    await Profile.findOneAndUpdate({userID:(req.oidc.user.sub).substring(15, 34)}, {coins: userProfile.coins + 10000});
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