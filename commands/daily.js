const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 jam
const REWARD = 500;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim duit harian!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId });
    }

    const now = Date.now();
    const lastClaim = user.lastDaily ? user.lastDaily.getTime() : 0;
    const timeDiff = now - lastClaim;

    if (timeDiff < COOLDOWN) {
      const timeLeft = COOLDOWN - timeDiff;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      const embedCooldown = new EmbedBuilder()
        .setColor('Red')
        .setTitle('⏳ Sudah claim!')
        .setDescription(`Cuba lagi dalam **${hours} jam ${minutes} minit**.`);

      return interaction.reply({ embeds: [embedCooldown], flags: 1 << 6 });
    }

    // Update balance dan lastDaily
    user.balance += REWARD;
    user.lastDaily = new Date();
    await user.save();

    const embedSuccess = new EmbedBuilder()
      .setColor('Green')
      .setTitle('💰 Duit Harian Diterima!')
      .setDescription(`${username}, anda telah menerima **${REWARD}** duit harian.`)
      .setFooter({ text: `Baki semasa: ${user.balance}` });

    await interaction.reply({ embeds: [embedSuccess], flags: 1 << 6 });
  }
};
