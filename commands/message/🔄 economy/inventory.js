const User = require('../../../models/User');

module.exports = {
  name: 'inventory',
  alias: ['pocket', 'bag'],
  description: 'Lihat inventori anda.',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.inventory || user.inventory.length === 0) {
      return message.reply(`**${message.author.username}**, You beg **<EMPTY>**.`);
    }

    // Formatkan setiap item dengan nama & durability/value
    const list = user.inventory
      .map((item, i) => 
        `**${i + 1}.** ${item.name} (Durability: ${item.durability}, Value: ${item.value})`
      )
      .join('\n');

    return message.reply(`**${message.author.username} , In you beg have **\n${list}`);
  }
};