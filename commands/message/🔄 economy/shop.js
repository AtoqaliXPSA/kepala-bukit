const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'shop',
  alias: ['store', 'market'],
  description: 'Lihat senarai item dalam kedai.',
  cooldown: 15,

  async execute(message) {
    const itemsPath = path.join(__dirname, '../../../data/items.json');
    const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

    if (!shopItems || shopItems.length === 0) {
      return message.reply('The shop is currently empty.');
    }

    // Guna embed supaya lebih kemas
    const embed = new EmbedBuilder()
      .setTitle(' **KB STORE**')
      .setColor('#00f0ff')
      .setDescription(
        shopItems
          .map((item, index) => 
            `**${index + 1}. ${item.name}** - **${item.price} coins**\n${item.description}`
          )
          .join('\n\n')
      )
      .setFooter({ text: 'Use djbuy <item name> to purchase an item.' });

    return message.channel.send({ embeds: [embed] });
  }
};