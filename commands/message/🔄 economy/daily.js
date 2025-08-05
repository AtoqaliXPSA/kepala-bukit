const User = require('../../../models/User');
const fs = require('fs');
const path = require('path');

const COOLDOWN = 24 * 60 * 60 * 1000;
const MIN_REWARD = 1000;
const MAX_REWARD = 3000;

const itemsPath = path.join(__dirname, '../../../data/items.json');
const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
const dailyItems = shopItems.filter(item => item.daily === true);

module.exports = {
  name: 'daily',
  alias: ['day'],
  description: 'Claim daily money and item reward!',

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
        `⏳ **${username}**, you already claim today . Claim back next day in **${hours} hours ${minutes} minit**.`
      );
    }

    const reward = Math.floor(Math.random() * (MAX_REWARD - MIN_REWARD + 1)) + MIN_REWARD;

    let itemToGive = null;
    if (dailyItems.length > 0) {
      const randomItem = dailyItems[Math.floor(Math.random() * dailyItems.length)];
      itemToGive = randomItem.name;

      user.inventory.push({
        name: randomItem.name,
        durability: randomItem.durability || 1,
        value: randomItem.value || 0
      });
    }

    user.balance += reward;
    user.lastDaily = new Date();
    await user.save();

    let reply = `🎁 **${username}**, you get some **${reward.toLocaleString()} coins** today!`;
    if (itemToGive) reply += `\n📦 You get some item: **${itemToGive}**!`;
    reply += `\n⏰ Next day : **${hours}H ${minutes}**.`;

    return message.reply(reply);
  }
};