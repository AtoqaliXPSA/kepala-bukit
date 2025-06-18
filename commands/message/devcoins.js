const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User'); // sesuaikan path jika perlu

module.exports = {
  name: 'devcoins',
  description: 'Admin sahaja: Beri coins kepada user.',
  cooldown: 3, // optional

  async execute(message, args, client) {
    const adminId = process.env.ADMIN_ID;
    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran untuk guna command ini.');
    }

    const mention = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!mention || isNaN(amount) || amount <= 0) {
      return message.reply('❗ Format salah. Contoh: `!devcoins @user 500`');
    }

    let userData = await User.findOne({ userId: mention.id });
    if (!userData) {
      userData = await User.create({ userId: mention.id });
    }

    userData.balance += amount;
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle('💸 Coins Diberikan')
      .setDescription(`✅ Berjaya beri **${amount}** coins kepada ${mention.tag}`)
      .setColor('Green')
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
};