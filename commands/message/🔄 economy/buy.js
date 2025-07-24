const fs = require('fs');
const path = require('path');
const User = require('../../../models/User');

// Load items.json
const itemsPath = path.join(__dirname, '../../../data/items.json');
const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

module.exports = {
  name: 'buy',
  description: 'Beli item dari shop.',
  cooldown: 5,

  async execute(message, args) {
    if (!args[0]) return message.reply('Please specify an item to buy.');

    const itemName = args.join(' ').toLowerCase();
    const item = shopItems.find(i => i.name.toLowerCase() === itemName);

    if (!item) return message.reply(`Item "${itemName}" not found in shop.`);

    const userId = message.author.id;
    let user = await User.findOne({ userId });

    if (!user) user = await User.create({ userId, balance: 0, inventory: [] });

    if (user.balance < item.price) {
      return message.reply(`You don't have enough coins. You need **${item.price} coins**.`);
    }

    // Deduct coins and add item
    user.balance -= item.price;

    // Add to inventory (as object)
    user.inventory.push({
      name: item.name,
      durability: item.durability,
      value: item.price
    });

    await user.save();

    message.reply(`You purchased **${item.name}** for **${item.price} coins**!`);
  }
};