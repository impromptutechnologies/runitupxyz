var request = require("request");
const Bet = require("../models/betSchema");

const betResultEsports = (id, option) => {
  const exists = Bet.find(
    {
      outcomeID: id,
    },
    (err, outcomeData) => {
      if (outcomeData.length == 0) {
        return console.log("no bets placed");
      } else {
        request(option, (error, response, body) => {
          data = JSON.parse(body);
          if (error) throw new Error(error);
          if (data[0].status == "finished") {
            const team1 = data[0].opponents[0].opponent.name;
            const team2 = data[0].opponents[1].opponent.name;
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

            if (data[0].winner_id == data[0].opponents[0].opponent.id) {
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

module.exports = betResultEsports;
