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

  app.route('/api/stock-prices')
    .get(function (req, res){
      axios.get("https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote")
      .then(function (response) {
        res.json(response);
      })
      .catch(function (error) {
        console.log(error);
      })
     
    });
    
};
