var request = require("request");
const Outcome = require("../models/outcomeSchema");
const moment = require("moment-timezone");
const setOdds = require("../utils/setOdds");

const newMatchesSoccer = (choice) => {

  var date = moment.utc().format("YYYY-MM-DD");
  var date2 = moment.utc(date).add(3, "weeks").format("YYYY-MM-DD")
  var date1 = moment.utc(date).add(3, "days").add().format("YYYY-MM-DD")
    //Maybe get all matches for the next two weeks?? and fill our the odds yourself or have a fucntion chekc for the matches of the day and then fill out the odds.
    //Might be a good idea. yuppio

    //Check every 3 mins if the odds are available. So if statement without an else. if its available do it if not eh. 
    
      const options = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 39,
          from: date,
          to:date1,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
      const optionsc = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 2,
          from: date,
          to:date2,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
      const optionsi = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 135,
          from: date,
          to:date1,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
      const optionss = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 140,
          from: date,
          to:date1,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
      const optionse = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 4,
          from: date,
          to:date1,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
/*
              &&
              (element.teams.home.name == 'Real Madrid' || element.teams.home.name == 'Barcelona' || element.teams.home.name == 'Atletico Madrid' || 
              element.teams.away.name == 'Atletico Madrid' || element.teams.away.name == 'Real Madrid' || element.teams.away.name == 'Barcelona')
            */


              /*const optionsb = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 78,
          from: date,
          to:date1,
          season: 2020
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
        },
      };
              &&
              (element.teams.home.name == 'Bayern Munich' || element.teams.home.name == 'Borussia Dortmund' || element.teams.home.name == 'RB Leipzig' || 
              element.teams.away.name == 'RB Leipzig' || element.teams.away.name == 'Borussia Dortmund' || element.teams.away.name == 'Bayern Munich')
            */
           
      if(choice == 'prem'){
        request(options, (error, response, body) => {
          datai = JSON.parse(body);
          if (error) throw new Error(error);
          
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "prem",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.fixture.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.fixture.date)
                      .add(2, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOdds('prem', element.fixture.id)
                  }
                );
                
              } else{
                console.log('element exists')
              }
           
                
              })
              
            });
        });
      }


      if(choice == 'champ'){
        request(optionsc, (error, response, body) => {
          datai = JSON.parse(body);
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
              ){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "champ",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.fixture.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.fixture.date)
                      .add(2, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOdds('champ', element.fixture.id)
                  }
                );
                
              } else{
                console.log('element exists')
              }
           
                
              })
              
            });
        });
      }


      if(choice == 'euros'){
        request(optionse, (error, response, body) => {
          datai = JSON.parse(body);
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
              ){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "euros",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.fixture.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.fixture.date)
                      .add(2, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOdds('euros', element.fixture.id)
                  }
                );
                
              } else{
                console.log('element exists')
              }
           
                
              })
              
            });
        });
      }


      if(choice == 'seriea'){
        request(optionsi, (error, response, body) => {
          datai = JSON.parse(body);
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
                
                &&
                (element.teams.home.name == 'Juventus' || element.teams.home.name == 'Inter' || element.teams.home.name == 'AC Milan' || element.teams.home.name == 'Napoli' || element.teams.home.name == 'AS Roma' || 
                element.teams.away.name == 'Juventus' || element.teams.away.name == 'Inter' || element.teams.away.name == 'AC Milan' || element.teams.away.name == 'Napoli' || element.teams.away.name == 'AS Roma') 
                
                ){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "rest",
                    spec:"seriea",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.fixture.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.fixture.date)
                      .add(2, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    
                    res.save();
                    setOdds('rest', element.fixture.id)
                  }
                );
                
              } else{
                console.log('element exists')
              }
           
                
              })
              
            });
        });
      }

      if(choice == 'laliga'){
        request(optionss, (error, response, body) => {
          datai = JSON.parse(body);
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
                &&
                (element.teams.home.name == 'Atletico Madrid' || element.teams.home.name == 'Real Madrid' || element.teams.home.name == 'Barcelona'
                || element.teams.away.name == 'Atletico Madrid' || element.teams.away.name == 'Real Madrid' || element.teams.away.name == 'Barcelona') 
                
                ){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "rest",
                    spec:"laliga",
                    team1: element.teams.home.name,
                    team2: element.teams.away.name,
                    timeStart: moment
                      .utc(element.fixture.date)
                      .format("MM-DD HH:mm"),
                    timeEnd: moment
                      .utc(element.fixture.date)
                      .add(2, "hours")
                      .format("MM-DD HH:mm"),
                  },
                  (err, res) => {
                    if(err){
                      console.log(err)
                    }
                    res.save();
                    setOdds('rest', element.fixture.id)
                  }
                );
                
              } else{
                console.log('element exists')
              }
           
                
              })
              
            });
        });
      }
   
      
    

  
};


module.exports = newMatchesSoccer;
