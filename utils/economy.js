// helpers/economy.js
const User = require('../models/User'); // MongoDB model user

module.exports = {
  async addCoins(userId, amount) {
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, coins: 0 });
    }
    user.coins += amount;
    await user.save();
    return user.coins;
  },

  async getCoins(userId) {
    const user = await User.findOne({ userId });
    return user ? user.coins : 0;
  }
};