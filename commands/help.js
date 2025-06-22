const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Senarai command slash bot ini.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Slash Command Tersedia')
      .setColor('Blue')
      .setDescription('Berikut adalah command yang boleh digunakan:');

    interaction.client.commands.forEach(cmd => {
      embed.addFields({
        name: `/${cmd.data.name}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], flag : 64 }); // hanya pengguna lihat
  }
};