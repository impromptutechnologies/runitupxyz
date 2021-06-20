const Outcome = require("../models/outcomeSchema");

const setOdds = (league, outcomeID) => {
  var request = require("request");
  console.log(league, outcomeID);
  //find the outcomes by the date
  Outcome.findOne(
    {
      category: "soccer",
      league: league,
      outcomeID:outcomeID
    },
    (err, res) => {
      if (err) {
        console.log(err);
      }
      console.log(res)
        if (res.option1.length == 0) {
          var options = {
            method: "GET",
            url: "https://v3.football.api-sports.io/odds",
            qs: { bet: "1", bookmaker: "1", fixture: outcomeID },
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
            },
          };
          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            data = JSON.parse(body);
            console.log(data);
            if(data.response[0] !== undefined){
              const code1 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}1`;
              const code2 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}2`;
              const code3 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}3`;
              res.addOptions([
                code1,
                parseFloat(data.response[0].bookmakers[0].bets[0].values[0].odd),
                code2,
                parseFloat(data.response[0].bookmakers[0].bets[0].values[2].odd),
                code3,
                parseFloat(data.response[0].bookmakers[0].bets[0].values[1].odd),
              ]);
              res.save();
            }
          });
        }
    }
  );
};

module.exports = setOdds;


/*
else{
              const code1 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}1`;
              const code2 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}2`;
              const code3 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}3`;
              res.addOptions([
                code1,
                0.0,
                code2,
                0.0,
                code3,
                0.0,
              ]);
              res.save();

            }*/