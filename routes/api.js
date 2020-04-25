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

function createURL (stockSymbol) {
  return `https://repeated-alpaca.glitch.me/v1/stock/${stockSymbol}/quote`;
} 

function fetchStockData (stockSymbol, like, ip, res) {
  axios.get(createURL(stockSymbol))
  .then(function (response) {
    let stockData = response.data;
    if (stockData == "Unknown symbol" || stockData == "Invalid symbol" || stockData == null) {
      return res.json("No stock found with provided symbol!");
    } else {
      findAndUpdateStock(stockData, null, null, res)
    }  
  })
  .catch(function (error) {
    console.log("Axios error:");
    console.log(error);
  });
}

function findAndUpdateStock (stockData, like, ip, res) {
  let conditions = {stockSymbol: stockData.symbol}
  let update = {};
  let options = {
    upsert: true,
    setDefaultsOnInsert: true,
    new: true
  }
  Stock.findOneAndUpdate(conditions, update, options, function(err, updatedStock) {
    if (err) {
      console.log(err);
    } else {
      Stock.findOne(conditions, function(err, foundStock) {
        if (err) {
          console.log(err);
        } else {
          if (like == "true" && foundStock.likedByIP.indexOf(ip) < 0) {
            foundStock.likedByIP.push(ip);
            foundStock.save();
          }
          let returnObject = {
            "stock": foundStock.stockSymbol,
            "company": stockData.companyName ? stockData.companyName : "No company name found!",
            "price": stockData[stockData.calculationPrice],
            "likes": foundStock.likedByIP.length
          }
          res.json(returnObject)
        }
      })
    }
  })
}

  app.route('/api/stock-prices')
    .get(function (req, res){
      fetchStockData(req.query.stock, null, null, res);
    });
    
};
