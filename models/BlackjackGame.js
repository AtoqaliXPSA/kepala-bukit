const mongoose = require('mongoose');

const blackjackGameSchema = new mongoose.Schema({
  userId: String,
  bet: Number,
  cards: [String],
  dealerCards: [String],
  result: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // auto-delete selepas 1 jam
  }
});

module.exports = mongoose.model('BlackjackGame', blackjackGameSchema);
