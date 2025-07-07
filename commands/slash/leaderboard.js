const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Lihat pengguna terkaya.'),

  async execute(interaction) {
    try {
      await interaction.deferReply(); // Untuk respon lambat tanpa timeout

      // Cari 10 pengguna tertinggi
      const topUsers = await User.find().sort({ balance: -1 }).limit(10);

      if (!topUsers.length) {
        return interaction.editReply('❌ Tiada data leaderboard ditemui.');
      }

      // Susun maklumat pengguna
      const leaderboardText = await Promise.all(topUsers.map(async (user, index) => {
        let userTag;
        try {
          const member = await interaction.client.users.fetch(user.userId);
          userTag = member.tag;
        } catch {
          userTag = `Pengguna Tidak Dikenali (${user.userId})`;
        }

        return `**#${index + 1}** - ${userTag} | 💰 ${user.balance.toLocaleString()} coins`;
      }));

      const embed = new EmbedBuilder()
        .setTitle('Top 10 Leaderboard')
        .setDescription(leaderboardText.join('\n'))
        .setColor(0x00AEFF)
        .setFooter({ text: `Diminta oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      interaction.editReply({ content: '❌ Ralat berlaku semasa ambil leaderboard.', flags: 64 });
    }
  }
};
