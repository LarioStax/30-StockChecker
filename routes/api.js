/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;

const Stock = require("../models/Stock.js");

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
    });
    
};
