const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'cash',
  alias: ['bal'],
  description: 'Lihat baki duit anda atau orang lain',
  cooldown: 5, // dalam saat

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;

    let user = await User.findOne({ userId: target.id });
    if (!user) user = await User.create({ userId: target.id });

    if (!user) {
      // Jika pengguna tiada dalam DB, daftar automatik dengan balance 0
      user = await User.create({ userId, balance: 0 });
    }

    message.reply(` **${message.author.username}**, you current have __**${user.balance.toLocaleString()}**__ __**DJCoins**__ .`);
  }
};