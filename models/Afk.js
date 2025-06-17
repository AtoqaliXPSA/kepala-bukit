const mongoose = require('mongoose');

const afkSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  reason: { type: String, default: 'Tidak dinyatakan' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Afk', afkSchema);