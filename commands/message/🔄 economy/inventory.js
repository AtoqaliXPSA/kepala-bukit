const User = require('../../../models/User');

module.exports = {
  name: 'inventory',
  alias: ['bag', 'pocket'],
  description: 'Lihat inventori anda.',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.inventory || user.inventory.length === 0) {
      return message.reply(`**${message.author.username}**, your bag is **<EMPTY>**.`);
    }

    // Kira jumlah item ikut nama
    const inventoryCount = {};
    for (const item of user.inventory) {
      const key = `${item.name} (Durability: ${item.durability}, Value: ${item.value})`;
      inventoryCount[key] = (inventoryCount[key] || 0) + 1;
    }

    const list = Object.entries(inventoryCount)
      .map(([item, count]) => `**${item}** x${count}`)
      .join('\n');

    message.reply(`**${message.author.username}, in your bag:**\n${list}`);
  }
};