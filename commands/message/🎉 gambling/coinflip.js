const { EmbedBuilder } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  name: 'coinflip',
  alias: ['cf'],
  cooldown: 10, // dalam saat

  async execute(message, args) {
    const pilihan = args[0]?.toLowerCase();
    const jumlah = parseInt(args[0]) || 1;

    if (!['head', 'tail'].includes(pilihan)) {
      return message.reply('❌ Sila pilih `head` atau `tail`.\nContoh: `!coinflip head 100`');
    }

    if (isNaN(jumlah) || jumlah <= 0) {
      return message.reply('❌ Jumlah pertaruhan tidak sah. Sila masukkan nombor positif.');
    }

    const userId = message.author.id;
    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    if (user.balance < jumlah) {
      return message.reply('💸 Anda tidak cukup duit untuk pertaruhan ini!');
    }

    const result = Math.random() < 0.5 ? 'head' : 'tail';
    let outcomeText = '';
    let color = '';

    if (result === pilihan) {
      const winnings = jumlah * 2;
      user.balance += jumlah; // untung: tambah sama jumlah asal
      outcomeText = `🎉 Anda menang! Coin mendarat pada **${result}** dan anda dapat **${winnings.toLocaleString()}** coins!`;
      color = 'Green';
    } else {
      user.balance -= jumlah;
      outcomeText = `😢 Anda kalah! Coin mendarat pada **${result}**. Anda hilang **${jumlah.toLocaleString()}** coins.`;
      color = 'Red';
    }

    await user.save();

    const embed = new EmbedBuilder()
      .setTitle('🪙 Coinflip')
      .setColor(color)
      .setDescription(outcomeText)
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
};