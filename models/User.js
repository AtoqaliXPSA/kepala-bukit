// models/User.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durability: { type: Number, default: 1 },
  value: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  inventory: { type: [itemSchema], default: [] },
  stamina: { type: Number, default: 5 },
  lastRegen: { type: Number, default: Date.now },
  lastDaily: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);