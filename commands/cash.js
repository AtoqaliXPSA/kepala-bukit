const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cash')
    .setDescription('Lihat baki duit anda atau orang lain')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Pilih pengguna')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    let user = await User.findOne({ userId: target.id });
    if (!user) user = await User.create({ userId: target.id });

    const embed = new EmbedBuilder()
      .setTitle(`Baki - Anda`)
      .setColor('Blue')
      .setDescription(`Duit semasa: **${user.balance}** DJCoins.`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
