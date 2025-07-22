const fs = require('fs');
const path = require('path');
const User = require('../../../models/User');

module.exports = {
  name: 'buy',
  description: 'Buy from shop.',

  async execute(message, args) {
    const userId = message.author.id;
    const itemName = args.join(' ');
    if (!itemName) return message.reply('List items name to buy something.');

    const itemsPath = path.join(__dirname, '../../../data/items.json');
    const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));
    const item = shopItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return message.reply('Item not found in store.');

    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId, balance: 0, inventory: [] });

    if (user.balance < item.price) {
      return message.reply(`You need **${item.price} coins**.`);
    }

    user.balance -= item.price;
    user.inventory.push({
      name: item.name,
      durability: item.durability ?? null
    });
    await user.save();

    message.reply(`< SUCCESSFUL > Done buy **${item.name}** (Durability: ${item.durability ?? '∞'}).`);
  }
};