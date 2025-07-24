const User = require('../../../models/User');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'inventory',
  alias: ['bag', 'pocket'],
  description: 'Check You Inventory',
  cooldown: 5,

  async execute(message, args) {
    const userId = message.author.id;
    const user = await User.findOne({ userId });

    if (!user || !user.inventory || user.inventory.length === 0) {
      return message.reply(`**${message.author.username}**, your bag is **<EMPTY>**.`);
    }

    // Group item ikut nama
    const itemMap = {};
    user.inventory.forEach(item => {
      itemMap[item.name] = (itemMap[item.name] || 0) + 1;
    });

    const groupedItems = Object.keys(itemMap).map(name => `${name} x${itemMap[name]}`);

    // Pagination setup
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(groupedItems.length / itemsPerPage));
    let page = Math.min(
      Math.max(parseInt(args[0]) || 1, 1),
      totalPages
    );

    const generateEmbed = (page) => {
      const start = (page - 1) * itemsPerPage;
      const paginatedItems = groupedItems.slice(start, start + itemsPerPage);
      const list = paginatedItems.map((item, i) => `**${start + i + 1}.** ${item}`).join('\n');

      return new EmbedBuilder()
        .setTitle(`${message.author.username}'s Inventory`)
        .setColor('#00ffcc')
        .setDescription(list || '*No items on this page*')
        .setFooter({ text: `Page ${page}/${totalPages}` })
        .setTimestamp();
    };

    // Hantar mesej embed pertama
    const embed = generateEmbed(page);
    const prevButton = new ButtonBuilder().setCustomId('prev').setLabel('Prev').setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

    const reply = await message.reply({ embeds: [embed], components: totalPages > 1 ? [row] : [] });

    if (totalPages > 1) {
      const collector = reply.createMessageComponentCollector({ time: 60000 });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply({ content: 'This inventory is not yours!', ephemeral: true });
        }

        if (interaction.customId === 'prev') page = page > 1 ? page - 1 : totalPages;
        else if (interaction.customId === 'next') page = page < totalPages ? page + 1 : 1;

        await interaction.update({ embeds: [generateEmbed(page)], components: [row] });
      });

      collector.on('end', () => {
        reply.edit({ components: [] }); // Disable buttons lepas 1 minit
      });
    }
  }
};