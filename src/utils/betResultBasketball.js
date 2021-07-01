var request = require("request");
const Bet = require("../models/betSchema");

const betResultBasketball = (id) => {
  const exists = Bet.find(
    {
      outcomeID: id,
    },
    (err, outcomeData) => {
      if (outcomeData.length == 0) {
        return console.log("no bets placed");
      } else {
        const options = {
          method: "GET",
          url: "https://v1.basketball.api-sports.io/games",
          qs: {
            id: id,
          },
          headers: {
            "x-rapidapi-host": "v1.basketball.api-sports.io",
            "x-rapidapi-key": process.env.API_SPORTS,
          },
        };
        request(options, (error, response, body) => {
          data = JSON.parse(body);
          if (error) throw new Error(error);
          if (
            data.response[0].status.short == "FT" ||
            data.response[0].status.short == "AOT"
          ) {
            const team1 = data.response[0].teams.home.name;
            const team2 = data.response[0].teams.away.name;
            const code1 = `${team1
              .substring(0, 3)
              .replace(/\s+/g, "")
              .toUpperCase()}${team2
              .substring(0, 3)
              .replace(/\s+/g, "")
              .toUpperCase()}1`;
            const code2 = `${team1
              .substring(0, 3)
              .replace(/\s+/g, "")
              .toUpperCase()}${team2
              .substring(0, 3)
              .replace(/\s+/g, "")
              .toUpperCase()}2`;
            if (
              data.response[0].scores.home.total >
              data.response[0].scores.away.total
            ) {
              Bet.updateMany({ Code: code1 }, { status: "won" }, (err, res) => {
                if (error) {
                  console.log(error);
                }
              });
              Bet.deleteMany(
                {
                  Code: code2,
                },
                (error, deleted) => {
                  if (error) {
                    console.log(error);
                  }
                }
              );
            } else {
              Bet.updateMany({ Code: code2 }, { status: "won" }, (err, res) => {
                if (error) {
                  console.log(error);
                }
              });
              Bet.deleteMany(
                {
                  Code: code1,
                },
                (error, deleted) => {
                  if (error) {
                    console.log(error);
                  }
                }
              );
            }
          } else {
            console.log("game still in progress");
          }
        });
      }
    }
  );
};

module.exports = betResultBasketball;
