const User = require('../../../models/User');

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 jam
const MIN_REWARD = 1000; // Minimum reward
const MAX_REWARD = 3000; // Maximum reward

module.exports = {
  name: 'daily',
  alias: ['day'],
  description: 'Claim daily money.',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;
    const username = message.author.username;

    // Cari user dalam database
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0 });
    }

    const now = Date.now();
    const lastClaim = user.lastDaily ? user.lastDaily.getTime() : 0;
    const timeDiff = now - lastClaim;

    // Cek cooldown 24 jam
    if (timeDiff < COOLDOWN) {
      const timeLeft = COOLDOWN - timeDiff;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      return message.reply(
        `**${username}**, You have already claimed your daily money! Try again in **${hours} hours ${minutes} minutes**.`
      );
    }

    // Ganjaran random antara 500 hingga 1000
    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    // Update balance & lastDaily
    user.balance += reward;
    user.lastDaily = new Date();
    await user.save();

    return message.reply(
      `**${username}**, You have received **${reward} coins** as daily cash!\n` +
      `Now Balance: **${user.balance.toLocaleString()} coins**.`
    );
  }
};