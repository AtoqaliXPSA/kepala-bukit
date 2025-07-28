const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  inventory: {
    type: [
      {
        name: { type: String, required: true },
        durability: { type: Number, default: 1 },
        value: { type: Number, default: 0 }
      }
    ],
    default: []
  },
  lastDaily: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);