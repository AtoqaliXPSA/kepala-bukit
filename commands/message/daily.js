const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

const COOLDOWN = 24 * 60 * 60 * 1000; // 24 jam
const REWARD = 500;

module.exports = {
  name: 'daily',
  alias: ['d'],
  cooldown: 5, // optional: cooldown untuk elak spam, 5s contohnya

  async execute(message, args, client) {
    const userId = message.author.id;
    const username = message.author.username;

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

      return message.reply({ embeds: [embedCooldown] });
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

    await message.reply({ embeds: [embedSuccess] });
  }
};