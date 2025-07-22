const User = require('../../../models/User');

module.exports = {
  name: 'inventory',
  alias: ['inv', 'bag'],
  description: 'To see you bag',
  cooldown: 3,

  async execute(message) {
    const userId = message.author.id;

    // Cari data user
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, bank: 0 });
    }

    const inv = user.inventory;

    if (!inv || inv.length === 0) {
      return message.reply('Inventory is empty.');
    }

    // Senaraikan item
    const itemList = inv
      .map((item, i) => `**${i + 1}.** ${item}`)
      .join('\n');

    const reply =
      `**Inventory ${message.author.username}:**\n` +
      '```\n' + itemList + '\n```';

    return message.reply(reply);
  }
};