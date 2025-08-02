const User = require('../../../models/User');
const fs = require('fs');
const path = require('path');

// Constants
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 jam
const MIN_REWARD = 1000;
const MAX_REWARD = 3000;

// Load items.json
const itemsPath = path.join(__dirname, '../../../data/items.json');
const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

// Tapis hanya item yang boleh didapati dari daily
const dailyItems = shopItems.filter(item => item.daily === true);

module.exports = {
  name: 'daily',
  alias: ['day'],
  description: 'Claim daily money and item reward!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;
    const username = message.author.username;
    const now = Date.now();

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, inventory: [] });
    }

    const lastClaim = user.lastDaily?.getTime() || 0;
    const timeDiff = now - lastClaim;

    if (timeDiff < COOLDOWN) {
      const timeLeft = COOLDOWN - timeDiff;
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);

      return message.reply(
        `⏳ **${username}**, kamu dah claim hari ini. Claim semula dalam **${hours} jam ${minutes} minit**.`
      );
    }

    // Ganjaran duit
    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    // Pilih item jika ada dalam senarai dailyItems
    let itemToGive = null;
    if (dailyItems.length > 0) {
      const randomItem = dailyItems[Math.floor(Math.random() * dailyItems.length)];
      itemToGive = randomItem?.name || null;
      user.inventory.push(itemToGive);
    }

    // Update user
    user.balance += reward;
    user.lastDaily = new Date();
    await user.save();

    // Balasan
    let reply = `🎁 **${username}**, kamu terima **${reward.toLocaleString()} coins** hari ini!`;
    if (itemToGive) reply += `\n📦 Kamu juga dapat barang misteri: **${itemToGive}**!`;
    reply += `\n💰 Baki sekarang: **${user.balance.toLocaleString()} coins**.`;

    return message.reply(reply);
  }
};