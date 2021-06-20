const Outcome = require("../models/outcomeSchema");

const setOddsB = (outcomeID) => {
  var request = require("request");

  Outcome.findOne(
    {
      category: "basketball",
      outcomeID:outcomeID
    },
    (err, res) => {
      if (err) {
        console.log(err);
      }
        if (res.option1.length == 0) {
          console.log(res);
          var options = {
            method: "GET",
            url: "https://v1.basketball.api-sports.io/odds",
            qs: { bet: "2", bookmaker: "2", game: outcomeID },
            headers: {
              "x-rapidapi-host": "v1.basketball.api-sports.io",
              "x-rapidapi-key": "e40fc324e790e08e5f948456fd4d1049",
            },
          };
          request(options, function (error, response, body) {
            if (error) throw new Error(error);
            data = JSON.parse(body);
            console.log(data);

            if (data.response[0] !== undefined) {
              const code1 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}1`;
              const code3 = `${res.team1
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}${res.team2
                .substring(0, 3)
                .replace(/\s+/g, "")
                .toUpperCase()}2`;
              res.addOptions([
                code1,
                data.response[0].bookmakers[0].bets[0].values[0].odd,
                /*code2,
                parseFloat(data.response[0].bookmakers[0].bets[0].values[2].odd),*/
                code3,
                data.response[0].bookmakers[0].bets[0].values[1].odd
              ]);
              res.save();
            }
          });
        }
    }
  );
};

module.exports = setOddsB;
