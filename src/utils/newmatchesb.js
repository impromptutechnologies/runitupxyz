var request = require("request");
const Outcome = require("../models/outcomeSchema");
const moment = require("moment-timezone");
const setOddsB = require("../utils/setOddsB");

const newMatchesBasketball = (daye) => {
    var day = moment.utc().format("DD");
        var month = moment.utc().format("MM");
        var year = moment.utc().format("YYYY");
        var date = moment.utc().format("YYYY-MM-DD");
        var date2 = moment.utc().add(1, "days").format("YYYY-MM-DD");
        var date3 = moment.utc().add(2, "days").format("YYYY-MM-DD");
        var date4 = moment.utc().add(3, "days").format("YYYY-MM-DD");
      const options = {
        method: "GET",
        url: "https://v1.basketball.api-sports.io/games",
        qs: {
          league: 12,
          season: "2020-2021",
          date: date,
        },
        headers: {
          "x-rapidapi-host": "v1.basketball.api-sports.io",
          "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
        },
      };
      const options1 = {
        method: "GET",
        url: "https://v1.basketball.api-sports.io/games",
        qs: {
          league: 12,
          season: "2020-2021",
          date: date2,
        },
        headers: {
          "x-rapidapi-host": "v1.basketball.api-sports.io",
          "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
        },
      };
      const options2 = {
        method: "GET",
        url: "https://v1.basketball.api-sports.io/games",
        qs: {
          league: 12,
          season: "2020-2021",
          date: date3,
        },
        headers: {
          "x-rapidapi-host": "v1.basketball.api-sports.io",
          "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
        },
      };

      if(daye=='1'){
        console.log('1')
        request(options, (error, response, body) => {
          data = JSON.parse(body);
          console.log(data);
          if (error) throw new Error(error);
          data.response.forEach((element)=>{
            console.log(element.date, element.teams.home.name);
            Outcome.findOne({category: "basketball", outcomeID: element.id}, (err, res) => {
              if(element.status.long == 'Not Started' && res == null){
                console.log('created')
                Outcome.create(
                  {
                    outcomeID: element.id,
                    category: "basketball",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.date)
                      .add(3, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOddsB(element.id);
                  }
                );
              } 


            }) 
          })
        });
      }
      if(daye=='2'){
        console.log('2')
        request(options1, (error, response, body) => {
          data = JSON.parse(body);
          console.log(data);
          if (error) throw new Error(error);
          data.response.forEach((element)=>{
            console.log(element.date, element.teams.home.name);
            Outcome.findOne({category: "basketball", outcomeID: element.id}, (err, res) => {
              if(element.status.long == 'Not Started' && res == null){
                console.log('created')
                Outcome.create(
                  {
                    outcomeID: element.id,
                    category: "basketball",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.date)
                      .add(3, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOddsB(element.id);
                  }
                );
              } 


            }) 
          })
        });
      }
      if(daye=='3'){
        console.log('3')
        request(options2, (error, response, body) => {
          data = JSON.parse(body);
          console.log(data);
          if (error) throw new Error(error);
          data.response.forEach((element)=>{
            console.log(element.date, element.teams.home.name);
            Outcome.findOne({category: "basketball", outcomeID: element.id}, (err, res) => {
              if(element.status.long == 'Not Started' && res == null){
                console.log('created')
                Outcome.create(
                  {
                    outcomeID: element.id,
                    category: "basketball",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.date)
                      .add(3, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOddsB(element.id);
                  }
                );
              } 
            }) 
          })
        });
      }
  };

  module.exports = newMatchesBasketball;
