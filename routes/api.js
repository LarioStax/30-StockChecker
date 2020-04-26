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

// function fetchPromise(stockSymbol, like, ip, res) {
//   return new Promise( function (resolve, reject) {
//     fetchStockData(stockSymbol, like, ip, res, function (returned) {
//       resolve(returned); 
//     })
//   })
// }

async function fetchStockData (stockSymbol, like, ip, res) {
  console.log(2);
  axios.get(createURL(stockSymbol))
  .then(function (response) {
    let stockData = response.data;
    if (stockData == "Unknown symbol" || stockData == "Invalid symbol" || stockData == null) {
      return res.json("No stock found with provided symbol!");
    } else {
      console.log(3);
      findAndUpdateStock(stockData, like, ip, res)
    }  
  })
  .catch(function (error) {
    console.log("Axios error:");
    console.log(error);
  });
}

async function findAndUpdateStock (stockData, like, ip, res) {
  let conditions = {stockSymbol: stockData.symbol}
  let update = {};
  let options = {
    upsert: true,
    setDefaultsOnInsert: true,
    new: true
  }
  let returnObject = {};
  console.log(4);
  Stock.findOneAndUpdate(conditions, update, options, function(err, updatedStock) {
    if (err) {
      console.log(err);
    } else {
      Stock.findOne(conditions, function(err, foundStock) {
        console.log(5);
        if (err) {
          console.log(err);
        } else {
          if (like == "true" && foundStock.likedByIP.indexOf(ip) < 0) {
            foundStock.likedByIP.push(ip);
            foundStock.save();
          }
          console.log(6);
          returnObject = {
            "stock": foundStock.stockSymbol,
            "company": stockData.companyName ? stockData.companyName : "No company name found!",
            "price": stockData[stockData.calculationPrice],
            "likes": foundStock.likedByIP.length
          }
          // console.log(foundStock.likedByIP)
          // res.json(returnObject);
        }
      })
      .then( function() {
        console.log(7);
        return returnObject;
      })
    }

  })
}

  app.route('/api/stock-prices')
    .get(function (req, res){
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
              likes: {$size: "$likedByIP"}
            }
          }
        ])
        .exec(function (err, foundStocks) {
          if (err) {
            console.log(err)
          } else {
            return res.json({"stockData": foundStocks});
          }
        });
      }
      //if one stock query
      if (typeof stockSymbol === "string") {
        console.log(1);
        let returnObject = fetchStockData(stockSymbol, like, ip, res);
        console.log(8);
        console.log(returnObject);
        // async function getReturnObject() {
        //   try {
        //     console.log("got here");
        //     let returnedObject = await fetchPromise(stockSymbol, like, ip, res);
        //     console.log(returnedObject);
        //   } catch(error) {
        //     console.log(error);
        //   }
        // }
        // getReturnObject(stockSymbol, like, ip, res)

        // let returnObject = yield wait.for (fetchStockData(stockSymbol, like, ip, res))
        // console.log(returnObject);
        // console.log(returnObject);
        // res.json({stockData: returnObject })
      } else {
        fetchStockData(stockSymbol, like, ip, res);
      }
    });
    
};
