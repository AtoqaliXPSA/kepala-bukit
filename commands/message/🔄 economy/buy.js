const fs = require('fs');
const path = require('path');
const User = require('../../../models/User');

// Load items.json
const itemsPath = path.join(__dirname, '../../../data/items.json');
const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

module.exports = {
  name: 'buy',
  description: 'Beli item dari shop dengan sokongan bulk buy.',
  cooldown: 15,

  async execute(message, args) {
    if (!args.length) {
      return message.reply('**Please specify an item to buy**');
    }

    // Semak quantity
    const quantityArg = parseInt(args[args.length - 1]);
    const quantity = !isNaN(quantityArg) && quantityArg > 0 ? quantityArg : 1;

    // Bulk Limit 
    if (quantity > 10) {
      return message.reply('You cannot buy more than 10 items at once.');
    }

    // Dapatkan nama item
    const itemName = (quantity > 1 ? args.slice(0, -1) : args).join(' ').toLowerCase();
    
    // Cari alias
    const item = shopItems.find(
      i => i.name.toLowerCase() === itemName || (i.alias && i.alias.includes(itemName))
    );

    if (!item) {
      return message.reply(`Item **"${itemName}"** not found in shop.`);
    }

    // Sekatan item
    if (item.unpurchasable) {
      return message.reply(`Item **${item.name}** cannot to buy.`);
    }

    // Harga total
    const totalPrice = item.price * quantity;

    // Dapatkan user
    const userId = message.author.id;
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, inventory: [] });
    }

    // Semak balance
    if (user.balance < totalPrice) {
      return message.reply(
        `You don't have enough coins . You need **${totalPrice} coins**<:Djcoins_6:1402689800267632690> (price : **${item.price}** x **${quantity}**).`
      );
    }

    // Tolak coins
    user.balance -= totalPrice;

    // Tambah item ke inventory
    for (let i = 0; i < quantity; i++) {
      user.inventory.push({
        name: item.name,
        durability: item.durability ?? 1,
        value: item.price
      });
    }

    await user.save();

    message.reply(
      `You purchased **${quantity}x ${item.name}** for **${totalPrice} coins**<:Djcoins_6:1402689800267632690>`
    );
  }
};