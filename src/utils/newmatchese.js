var request = require("request");
const Outcome = require("../models/outcomeSchema");
const moment = require("moment-timezone");

const newMatchesEsports = (choice) => {
  
    var day = moment.utc().format("DD");
        var month = moment.utc().format("MM");
        var date = moment.utc().format("MM-DD HH:mm");
        var date2 = moment.utc().add(5, "days").format("MM-DD HH:mm");
        const request = require('request');

        const options = {
          method: 'GET',
          url: 'https://api.pandascore.co/codmw/matches/upcoming',
          headers: {
            'Authorization': 'Bearer hCHqW_AKX0xtmdSF5ZACti9M9LcLsWKKa52M70hWWy7aGEaql5M',
            'host': 'api.pandascore.co',
            useQueryString: true
          }
        };

        const optionscsgo = {
          method: 'GET',
          url: 'https://api.pandascore.co/csgo/matches/upcoming?filter[league_id]=4551,4568,4569,4572',
          headers: {
            'Authorization': 'Bearer hCHqW_AKX0xtmdSF5ZACti9M9LcLsWKKa52M70hWWy7aGEaql5M',
            'host': 'api.pandascore.co',
            useQueryString: true
          }
        };

        const optionsdota = {
          method: 'GET',
          url: 'https://api.pandascore.co/dota2/matches/upcoming?filter[league_id]=4447,4487,4517',
          headers: {
            'Authorization': 'Bearer hCHqW_AKX0xtmdSF5ZACti9M9LcLsWKKa52M70hWWy7aGEaql5M',
            'host': 'api.pandascore.co',
            useQueryString: true
          }
        };

        const optionsleague = {
          method: 'GET',
          url: 'https://api.pandascore.co/lol/matches/upcoming?filter[league_id]=4198,4394,4197,4407,300',
          headers: {
            'Authorization': 'Bearer hCHqW_AKX0xtmdSF5ZACti9M9LcLsWKKa52M70hWWy7aGEaql5M',
            'host': 'api.pandascore.co',
            useQueryString: true
          }
        };


        request(options, (error, response, body) => {
          data = JSON.parse(body);
          console.log(data)
          if (error) throw new Error(error);
          data.forEach((element) => {
            console.log(element.begin_at)
            Outcome.findOne({outcomeID: element.id}, (err, res) => {
              if(!(element.opponents.length < 2) && res == null){
                if((element.status == 'not_started') && ((moment
                  .utc(element.begin_at)
                  .format("MM-DD HH:mm") < date) == false) && ((moment
                    .utc(element.begin_at)
                    .format("MM-DD HH:mm") < date2))){
                      Outcome.create(
                        {
                          outcomeID: element.id,
                          category: "esportscod",
                          team1: element.opponents[0].opponent.name,
                          team2: element.opponents[1].opponent.name,
                          timeStart: moment
                            .utc(element.begin_at)
                            .format("MM-DD HH:mm"),
                          timeEnd: moment
                            .utc(element.begin_at)
                            .add(1, "hours")
                            .format("MM-DD HH:mm"),
                        },
                        (err, res) => {
                          if(err){
                            console.log(err)
                          }
                          const code1 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}1`)
                          const code2 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}2`)
                          res.addOptions([
                            code1,
                            0.0,
                            code2,
                            0.0,
                          ]);
                          res.save();
                        }
                      );
                  }
              }
            });
          })
        });


      
        request(optionscsgo, (error, response, body) => {
          data = JSON.parse(body);
          console.log(data)
          if (error) throw new Error(error);
          data.forEach((element) => {
            console.log(element.begin_at)
            Outcome.findOne({outcomeID: element.id}, (err, res) => {
              if(!(element.opponents.length < 2) && res == null){
                if((element.status == 'not_started') && ((moment
                  .utc(element.begin_at)
                  .format("MM-DD HH:mm") < date) == false) && ((moment
                    .utc(element.begin_at)
                    .format("MM-DD HH:mm") < date2))){
                      Outcome.create(
                        {
                          outcomeID: element.id,
                          category: "esportscsgo",
                          team1: element.opponents[0].opponent.name,
                          team2: element.opponents[1].opponent.name,
                          timeStart: moment
                            .utc(element.begin_at)
                            .format("MM-DD HH:mm"),
                          timeEnd: moment
                            .utc(element.begin_at)
                            .add(2, "hours")
                            .format("MM-DD HH:mm"),
                        },
                        (err, res) => {
                          if(err){
                            console.log(err)
                          }
                          const code1 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}1`)
                          const code2 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}2`)
                          res.addOptions([
                            code1,
                            0.0,
                            code2,
                            0.0,
                          ]);
                          res.save();
                        }
                      );
                  }
              }
            });
          })
        });
        
      request(optionsdota, (error, response, body) => {
        data = JSON.parse(body);
        console.log(data)
        if (error) throw new Error(error);
        data.forEach((element) => {
          console.log(element.begin_at)
          Outcome.findOne({outcomeID: element.id}, (err, res) => {
            if(!(element.opponents.length < 2) && res == null){
              if((element.status == 'not_started') && ((moment
                .utc(element.begin_at)
                .format("MM-DD HH:mm") < date) == false) && ((moment
                  .utc(element.begin_at)
                  .format("MM-DD HH:mm") < date2))){
                    Outcome.create(
                      {
                        outcomeID: element.id,
                        category: "esportsdota",
                        team1: element.opponents[0].opponent.name,
                        team2: element.opponents[1].opponent.name,
                        timeStart: moment
                          .utc(element.begin_at)
                          .format("MM-DD HH:mm"),
                        timeEnd: moment
                          .utc(element.begin_at)
                          .add(2, "hours")
                          .format("MM-DD HH:mm"),
                      },
                      (err, res) => {
                        if(err){
                          console.log(err)
                        }
                        const code1 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}1`)
                        const code2 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}2`)
                        res.addOptions([
                          code1,
                          0.0,
                          code2,
                          0.0,
                        ]);
                        res.save();
                      }
                    );
                }
            }
          });
        })
      });
     
      

      request(optionsleague, (error, response, body) => {
        data = JSON.parse(body);
        console.log(data)
        if (error) throw new Error(error);
        data.forEach((element) => {
          console.log(element.begin_at)
          Outcome.findOne({outcomeID: element.id}, (err, res) => {
            if(!(element.opponents.length < 2) && res == null){
              if((element.status == 'not_started') && ((moment
                .utc(element.begin_at)
                .format("MM-DD HH:mm") < date) == false) && ((moment
                  .utc(element.begin_at)
                  .format("MM-DD HH:mm") < date2))){
                    Outcome.create(
                      {
                        outcomeID: element.id,
                        category: "esportslol",
                        team1: element.opponents[0].opponent.name,
                        team2: element.opponents[1].opponent.name,
                        timeStart: moment
                          .utc(element.begin_at)
                          .format("MM-DD HH:mm"),
                        timeEnd: moment
                          .utc(element.begin_at)
                          .add(2, "hours")
                          .format("MM-DD HH:mm"),
                      },
                      (err, res) => {
                        if(err){
                          console.log(err)
                        }
                        const code1 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}1`)
                        const code2 = (`${element.opponents[0].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}${element.opponents[1].opponent.name.substring(0,3).replace(/\s+/g, '').toUpperCase()}2`)
                        res.addOptions([
                          code1,
                          0.0,
                          code2,
                          0.0,
                        ]);
                        res.save();
                      }
                    );
                }
            }
          });
        })
      });
    
  };

  module.exports = newMatchesEsports;
