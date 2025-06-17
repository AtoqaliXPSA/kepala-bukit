const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Senarai command slash bot ini.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Slash Command Tersedia')
      .setColor('Blurple')
      .setDescription('Berikut adalah command yang boleh digunakan:')
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    interaction.client.commands.forEach(cmd => {
      embed.addFields({
        name: `/${cmd.data.name}`,
        value: cmd.data.description || 'Tiada deskripsi.',
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], ephemeral: true }); // hanya pengguna lihat
  }
};