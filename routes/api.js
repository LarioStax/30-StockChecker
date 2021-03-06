/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;
const axios = require("axios").default;

const Stock = require("../models/Stock.js");

module.exports = function (app) {

  function createURL(stockSymbol) {
    return encodeURI(`https://repeated-alpaca.glitch.me/v1/stock/${stockSymbol}/quote`);
  }

  //Does the API request to get the stock data and calls the db function
  function fetchStockData(stockSymbol, like, ip, res) {
    return new Promise(function (resolve, reject) {
      axios.get(createURL(stockSymbol))
        .then(function (response) {
          let stockData = response.data;
          if (stockData == "Unknown symbol" || stockData == "Invalid symbol" || stockData == null) {
            reject("No stock found with provided symbol!");
          } else {
            findAndUpdateStock(stockData, like, ip, res).then(function (returnObject) {
              resolve(returnObject);
            }).catch(function (error) {
              console.log(error.response);
              reject("There was a problem with getting your requested stock!");
            });
          }
        })
    })
  }

  function findAndUpdateStock(stockData, like, ip, res) {
    let conditions = { stockSymbol: stockData.symbol }
    let update = {};
    let options = {
      upsert: true,
      setDefaultsOnInsert: true,
      new: true
    }
    let returnObject = {};

    return new Promise(function (resolve, reject) {
      //Searches for requested stock in DB and creates it if not found
      Stock.findOneAndUpdate(conditions, update, options, function (err, updatedStock) {
        if (err) {
          reject("Error while searching/creating the requested stock in database!");
        } else {
          //Searches for requested (and maybe newly created) stock in db
          Stock.findOne(conditions, function (err, foundStock) {
            if (err) {
              console.log(err);
            } else {
              if (like == "true" && foundStock.likedByIP.indexOf(ip) < 0) {
                foundStock.likedByIP.push(ip);
                foundStock.save();
              }
              returnObject = {
                "stock": foundStock.stockSymbol,
                "company": stockData.companyName ? stockData.companyName : "No company name found!",
                "price": stockData[stockData.calculationPrice] ? stockData[stockData.calculationPrice] : stockData.latestPrice,
                "likes": foundStock.likedByIP.length
              }
              resolve(returnObject);
            }
          }).catch(function (error) {
            reject(error);
          });
        }
      })
    })
  }

  async function getTwoStocks(stockSymbol, like, ip, res) {
    const firstStock = await fetchStockData(stockSymbol[0], like, ip, res);
    const secondStock = await fetchStockData(stockSymbol[1], like, ip, res);

    let returnStocks = [];
    returnStocks.push(firstStock);
    returnStocks.push(secondStock);
    return returnStocks;
  }

  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stockSymbol = req.query.stock;
      const like = (req.query.like == "true") ? "true" : "false";
      // const ip = req.ip //express => does it always work? why is it not most popular answer on stackoverflow?
      // const ip = (req.headers["x-forwarded-for"]) ? req.headers["x-forwarded-for"].split(",")[0] : req.connection.remoteAddress
      const ip = (req.headers['x-forwarded-for'] || '').split(',').pop() || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress; //from stackoverflow

      //if no stock query => return all already searched stocks in db
      if (!stockSymbol) {
        Stock.aggregate([
          {
            $project: {
              _id: 0,
              stockSymbol: 1,
              likes: { $size: "$likedByIP" }
            }
          }
        ])
          .exec(function (err, foundStocks) {
            if (err) {
              console.log(err)
            } else {
              return res.json({ "stockData": foundStocks });
            }
          });
      }

      //handler for one stock in query
      if (typeof stockSymbol === "string" && stockSymbol.length > 0) { //avoids handling empty string
        fetchStockData(stockSymbol, like, ip, res)
          .then(function (returnedObject) {
            return res.json({ "stockData": returnedObject });
          }).catch(function (error) {
            console.log(error);
            return res.json(error);
          })
      }

      //handler for two stocks in query
      if (typeof stockSymbol === "object" && stockSymbol.length === 2) {
        let stockData = [];

        getTwoStocks(stockSymbol, like, ip, res)
          .then(function (returnedStocks) {

            let firstStockData = {
              stock: returnedStocks[0].stock,
              company: returnedStocks[0].company,
              price: returnedStocks[0].price,
              rel_likes: returnedStocks[0].likes - returnedStocks[1].likes
            }
            stockData.push(firstStockData);

            let secondStockData = {
              stock: returnedStocks[1].stock,
              company: returnedStocks[1].company,
              price: returnedStocks[1].price,
              rel_likes: returnedStocks[1].likes - returnedStocks[0].likes
            }
            stockData.push(secondStockData);
            return res.json({stockData: stockData});
          });
      }

      //handler for more than two stocks in query
      if (typeof stockSymbol === "object" && stockSymbol.length > 2) {
        return res.json("Please, request max two stocks at a time.")
      }
    });
};
