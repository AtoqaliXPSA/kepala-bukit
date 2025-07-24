const fs = require('fs');
const path = require('path');
const User = require('../../../models/User');

module.exports = {
  name: 'sell',
  description: 'Jual item dari inventory untuk dapatkan coins.',
  cooldown: 10,

  async execute(message, args) {
    const userId = message.author.id;

    if (!args.length) {
      return message.reply('Please specify the item name and optionally a quantity.\nExample: `!sell Luck Coin 3`');
    }

    // Tentukan quantity (default 1)
    const quantityArg = parseInt(args[args.length - 1]);
    const isQuantity = !isNaN(quantityArg);
    const quantity = isQuantity ? Math.max(1, quantityArg) : 1;
    const itemName = (isQuantity ? args.slice(0, -1) : args).join(' ').toLowerCase();

    // Load shop items
    const itemsPath = path.join(__dirname, '../../../data/items.json');
    const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

    // Cari item berdasarkan name atau alias
    const item = shopItems.find(i =>
      i.name.toLowerCase() === itemName || (i.alias && i.alias.map(a => a.toLowerCase()).includes(itemName))
    );

    if (!item) {
      return message.reply(`Item **${itemName}** is not recognized.`);
    }

    // Cek jika item boleh dijual
    if (item.untradable) {
      return message.reply(`The item **${item.name}** cannot be sold.`);
    }

    // Cari user
    const user = await User.findOne({ userId });
    if (!user || !user.inventory || user.inventory.length === 0) {
      return message.reply('You have no items in your inventory to sell.');
    }

    // Cari berapa banyak item user ada
    const userItems = user.inventory.filter(invItem => invItem.name === item.name);
    const userItemCount = userItems.length;

    if (userItemCount < quantity) {
      return message.reply(`You only have **${userItemCount}x ${item.name}** but you tried to sell **${quantity}x**.`);
    }

    // Harga jual (60% dari harga beli)
    const sellPrice = Math.floor(item.price * 0.6) * quantity;

    // Buang item dari inventory ikut kuantiti
    let removed = 0;
    user.inventory = user.inventory.filter(invItem => {
      if (invItem.name === item.name && removed < quantity) {
        removed++;
        return false; // buang item ini
      }
      return true;
    });

    // Tambah coins kepada user
    user.balance += sellPrice;
    await user.save();

    return message.reply(`You sold **${quantity}x ${item.name}** for **${sellPrice} coins**!`);
  }
};