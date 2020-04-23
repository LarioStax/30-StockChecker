const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    likedByIP: [String],
    likes: 0
})

let Stock = mongoose.model("Stock, stockSchema");

module.exports = Stock;