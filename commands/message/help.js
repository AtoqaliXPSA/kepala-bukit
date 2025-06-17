const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Senarai command yang tersedia.',

  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';

    const embed = new EmbedBuilder()
      .setTitle('📖 Senarai Command')
      .setDescription('Berikut adalah command yang boleh digunakan:')
      .setColor('Blue')
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    client.messageCommands.forEach(cmd => {
      embed.addFields({
        name: `${prefix}${cmd.name}`,
        value: cmd.description || 'Tiada deskripsi.',
        inline: false
      });
    });

    message.reply({ embeds: [embed] });
  }
};