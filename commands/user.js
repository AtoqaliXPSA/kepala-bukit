const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Tunjukkan profil anda dalam bot'),

  async execute(interaction) {
    const member = interaction.member;
    const user = await getUser(interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor('#00f6ff')
      .setTitle(`👤 Profil ${interaction.user.username}`)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 ID', value: interaction.user.id, inline: true },
        { name: '💰 Baki', value: `${user.balance.toLocaleString()} coins`, inline: true },
        { name: '📅 Sertai Discord', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: '📥 Sertai Server Ini', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false }
      )
      .setFooter({ text: 'Gunakan command ekonomi lain untuk jana pendapatan!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};