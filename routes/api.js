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
    res.json(stockData);
  })
  .catch(function (error) {
    console.log(error);
  });
}

  app.route('/api/stock-prices')
    .get(function (req, res){
      fetchStockData(req.query.stock, null, null, res);
    });
    
};
