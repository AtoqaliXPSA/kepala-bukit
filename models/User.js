const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  lastDaily: { type: Date, default: null },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  lastWork: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);