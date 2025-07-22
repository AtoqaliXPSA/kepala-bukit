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
      return message.reply(`**${message.author.displayName}** , Inventory is < EMPTY >.`);
    }

    const list = user.inventory
      .map((item, i) => `**${i + 1}.** ${item}`)
      .join('\n');

    message.reply(`**In your bag:**\n${list}`);
  }
};