const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    stockName: String,
    stockSymbol: String,
    likedByIP: [String]
})

let Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;