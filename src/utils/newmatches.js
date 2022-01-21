var request = require("request");
const Outcome = require("../models/outcomeSchema");
const moment = require("moment-timezone");
const setOdds = require("../utils/setOdds");

const newMatchesSoccer = (choice) => {
  console.log(choice)

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
          season: 2021
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
          season: 2021
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
          season: 2021
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
          season: 2021
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.API_SPORTS,
        },
      };
      const optionsb = {
        method: "GET",
        url: "https://v3.football.api-sports.io/fixtures",
        qs: {
          league: 78,
          from: date,
          to:date1,
          season: 2021
        },
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
        },
      };

      

      if(choice == 'prem'){
        request(options, (error, response, body) => {
          if (error) throw new Error(error);
          const datai = JSON.parse(body);
          console.log(datai)
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
                 
                &&
                (element.teams.home.name == 'Manchester United' || element.teams.home.name == 'Liverpool' || element.teams.home.name == 'Arsenal' || element.teams.home.name == 'Everton' || element.teams.home.name == 'Tottenham' || element.teams.home.name == 'Chelsea' || element.teams.home.name == 'Manchester City' || 
                element.teams.away.name == 'Manchester United' || element.teams.away.name == 'Liverpool' || element.teams.away.name == 'Arsenal' || element.teams.away.name == 'Everton' || element.teams.away.name == 'Tottenham' || element.teams.away.name == 'Manchester City' || element.teams.home.name == 'Chelsea') ){
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
          const datai = JSON.parse(body);
          console.log(datai);
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null 
                &&
                (element.teams.home.name == 'Juventus' || element.teams.home.name == 'Inter' || element.teams.home.name == 'Atalanta' 
                || element.teams.home.name == 'Manchester City' || element.teams.home.name == 'Liverpool' || element.teams.home.name == 'Manchester United' || element.teams.home.name == 'Chelsea' || 
                element.teams.away.name == 'Juventus' || element.teams.away.name == 'Inter'|| element.teams.away.name == 'Atalanta' 
                || element.teams.away.name == 'Manchester City' || element.teams.home.name == 'Liverpool' || element.teams.home.name == 'Manchester United' || element.teams.home.name == 'Chelsea' || 
                element.teams.home.name == 'Bayern Munich' || element.teams.home.name == 'Borussia Dortmund' || element.teams.home.name == 'RB Leipzig' || 
                element.teams.away.name == 'RB Leipzig' || element.teams.away.name == 'Borussia Dortmund' || element.teams.away.name == 'Bayern Munich'
                ) 
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

      if(choice == 'seriea'){
        request(optionsi, (error, response, body) => {
          const datai = JSON.parse(body);
          console.log(datai)
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

      if(choice == 'bundes'){
        request(optionsb, (error, response, body) => {
          const datai = JSON.parse(body);
          console.log(datai)
          if (error) throw new Error(error);
          datai.response.forEach((element) => {
              Outcome.findOne({outcomeID: element.fixture.id}, (err, res) => {
                if(element.fixture.status.long == 'Not Started' && res == null
                
                &&
              (element.teams.home.name == 'Bayern Munich' || element.teams.home.name == 'Borussia Dortmund' || element.teams.home.name == 'RB Leipzig' || 
              element.teams.away.name == 'RB Leipzig' || element.teams.away.name == 'Borussia Dortmund' || element.teams.away.name == 'Bayern Munich')
                
                ){
                Outcome.create(
                  {
                    outcomeID: element.fixture.id,
                    category: "soccer",
                    league: "rest",
                    spec:"bundes",
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
          const datai = JSON.parse(body);
          console.log(datai)
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
