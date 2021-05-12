const express = require('express')
const path = require('path')
const hbs = require('hbs')
const Profile = require('./models/profileSchema')
const Outcome = require('./models/outcomeSchema')
const Casino = require('./models/casinoSchema')
const Stock = require('./models/stockSchema.js')
const Crypto = require('./models/cryptoSchema.js')
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



app.get('/', (req, res) => {
    res.render('index');
    /*console.log(moment().format('LT'));
    console.log(moment.tz("America/New_York"));
    console.log(moment.tz.guess());
    newYork.clone().tz("Europe/London");
    console.log(moment().utcOffset())

    const time = moment().format('LT')
    console.log(moment(date_to_convert).utc().format("YYYY-MM-DD HH:mm:ss"))*/
    var day = moment.utc().format('DD')
    var month = moment.utc().format('MM')
    var date = moment.utc().format('MM-DD HH:mm');
    var date1 = moment.utc().format(`${parseInt(month)}-${parseInt(day)} 13:30`);
    var date2 = moment.utc().format(`${parseInt(month)}-${parseInt(day)} 20:00`);
    var stillUtc = moment.utc(date1).toDate();
    var local = moment(stillUtc).local().format('MM-DD HH:mm');
    var stillUtc2 = moment.utc(date2).toDate();
    var local2 = moment(stillUtc2).local().format('MM-DD HH:mm');
    console.log(date1)
    console.log(date2)
    console.log(local)
    console.log(local2)
    if(date < date1 && date > date2){
        console.log('hellooooo')
    }
    
})

app.get('', (req, res) => {
    res.render('index')
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

app.get('/tokens', async (req, res) => {
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