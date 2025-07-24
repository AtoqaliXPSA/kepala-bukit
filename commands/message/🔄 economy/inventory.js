const User = require('../../../models/User');

module.exports = {
  name: 'inventory',
  alias: ['pocket', 'bag'],
  description: 'Check User inventory/beg',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.inventory || user.inventory.length === 0) {
      return message.reply(`**${message.author.username}**, Nothing in your beg.`);
    }

    // Gabungkan item sama dengan count dan total value
    const grouped = {};
    for (const item of user.inventory) {
      const key = `${item.name}|${item.durability}|${item.value}`;
      if (!grouped[key]) {
        grouped[key] = { ...item, qty: 1, totalValue: item.value };
      } else {
        grouped[key].qty++;
        grouped[key].totalValue += item.value;
      }
    }

    // Senarai yang sudah compress
    const list = Object.values(grouped)
      .map((item, i) =>
        `**${i + 1}.** ${item.name} x${item.qty} ` +
        `(Durability: ${item.durability}, Total Value: ${item.totalValue})`
      )
      .join('\n');

    message.reply(`**${message.author.username}, In you beg have **\n${list}`);
  }
};