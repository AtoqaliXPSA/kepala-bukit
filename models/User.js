// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  inventory: { type: [String], default: [] },
  stamina: { type: Number, default: 5 },
  lastRegen: { type: Number, default: Date.now },
  lastDaily: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);