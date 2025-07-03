// models/LotteryTicket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: String,
  count: { type: Number, default: 1 }
});

module.exports = mongoose.model('LotteryTicket', ticketSchema);