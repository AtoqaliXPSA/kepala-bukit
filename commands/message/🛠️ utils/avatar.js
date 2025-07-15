const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  alias: ['av'],
  description: 'Paparkan avatar pengguna',
  cooldown: 3, // opsyenal

  async execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`Avatar`)
      .setImage(avatarUrl)
      .setURL(avatarUrl)
      .setColor('#00f6ff')
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};