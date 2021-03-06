const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    stockSymbol: String,
    likedByIP: [String]
})

let Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;