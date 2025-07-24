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
      return message.reply(`**${message.author.username}** , your bag is **<EMPTY>**.`);
    }

  // Group item ikut nama
  const itemMap = {};
  user.inventory.forEach(item => {
    itemMap[item.name] = (itemMap[item.name] || 0) + 1;
  });

  const groupedItems = Object.keys(itemMap).map(name => `${name} x${itemMap[name]}`);

  // Pagination setup
  const itemsPerPage = 10;
  const totalPages = Math.ceil(groupedItems.length / itemsPerPage);
  const page = Math.min(
    Math.max(parseInt(args[0]) || 1, 1),
    totalPages
  );

  const start = (page - 1) * itemsPerPage;
  const paginatedItems = groupedItems.slice(start, start + itemsPerPage);

  const list = paginatedItems.map((item, i) => `**${start + i + 1}.** ${item}`).join('\n');

  return message.reply(
    `**${message.author.username}, your inventory:**\n${list}\n\n**Page:** ${page}/${totalPages}`
  );
}
};