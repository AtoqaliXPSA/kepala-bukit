const User = require('../../models/User');
const { Collection } = require('discord.js');

let lotteryPool = 0;
const ticketPrice = 1000; // 💰 Harga tiket ditetapkan $1,000
const tickets = new Collection(); // Simpan jumlah tiket setiap user

module.exports = {
  name: 'lottery',
  alias: ['lotto', 'loteri'],
  description: 'Beli tiket loteri dan menangi hadiah besar!',
  cooldown: 10,

  async execute(message, args) {
    const userId = message.author.id;
    const user = await User.findOne({ userId }) || await new User({ userId, balance: 500 }).save();

    const subcommand = args[0];

    if (!subcommand || subcommand === 'buy') {
      if (user.balance < ticketPrice) {
        return message.reply(`Anda perlukan **$${ticketPrice}** untuk beli tiket loteri.`);
      }

      // 🚀 Potong duit, tambah tiket & pool
      user.balance -= ticketPrice;
      lotteryPool += ticketPrice;
      tickets.set(userId, (tickets.get(userId) || 0) + 1);
      await user.save();

      return message.channel.send(
        `Anda telah beli **1 tiket loteri** dengan harga $${ticketPrice}!\n` +
        `Pool sekarang: **$${lotteryPool}**`
      );
    }

    if (subcommand === 'info') {
      return message.channel.send(
        `**INFO LOTERI**\n` +
        `Harga tiket: $${ticketPrice}\n` +
        `Pool semasa: $${lotteryPool}\n` +
        `Jumlah penyertaan: ${tickets.size}`
      );
    }

    return message.reply('Penggunaan: `!lottery [buy/info]`');
  }
};