const User = require('../../../models/User');

module.exports = {
  name: 'additem',
  description: 'Add items',
  async execute(message, args) {
    const userId = message.author.id;
    const item = args.join(' ');

    if (!item) return message.reply('Please name items first.');

    const user = await User.findOneAndUpdate(
      { userId },
      { $push: { inventory: item } },
      { new: true, upsert: true }
    );

    message.reply(`\`< VERIFY > Item **${item}** add to you inventory.`);
  }
};