const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'cash',
  description: 'Lihat baki duit anda atau orang lain',
  cooldown: 5, // dalam saat

  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;

    let user = await User.findOne({ userId: target.id });
    if (!user) user = await User.create({ userId: target.id });

    const embed = new EmbedBuilder()
      .setTitle(` Baki - ${target.username}`)
      .setColor('Blue')
      .setDescription(`Duit semasa: **${user.balance.toLocaleString()}** DJCoins.`);

    return message.reply({ embeds: [embed] });
  }
};