const { EmbedBuilder } = require('discord.js');

// Senarai warna dengan HEX
const colorList = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Lime', hex: '#32CD32' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Maroon', hex: '#800000' }
];

module.exports = {
  name: 'color',
  alias: ['colour', 'warna'],
  description: 'Pilih warna atau dapatkan warna rawak.',
  cooldown: 3,

  async execute(message, args) {
    let chosenColor;

    // Pilih warna ikut input atau random
    if (args.length > 0) {
      const userColor = args.join(' ').toLowerCase();

      const foundColor = colorList.find(
        c => c.name.toLowerCase() === userColor
      );

      if (!foundColor) {
        return message.reply(
          `❌ Color **${userColor}** not found.\n` +
          `Available colors: \`${colorList.map(c => c.name).join(', ')}\``
        );
      }

      chosenColor = foundColor;
    } else {
      chosenColor = colorList[Math.floor(Math.random() * colorList.length)];
    }

    // Embed yang kemas
    const embed = new EmbedBuilder()
      .setTitle(`🎨 | Color Preview: **${chosenColor.name}**`)
      .setColor(chosenColor.hex)
      .setThumbnail(`https://singlecolorimage.com/get/${chosenColor.hex.slice(1)}/200x200`)
      .addFields(
        { name: 'Color Name', value: `\`${chosenColor.name}\``, inline: true },
        { name: 'HEX Code', value: `\`${chosenColor.hex}\``, inline: true },
        { name: '\u200B', value: '\u200B' }, // spacing
        { name: 'Info', value: `Use HEX code **${chosenColor.hex}** in your design.` }
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};