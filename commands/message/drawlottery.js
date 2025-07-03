const User = require('../../models/User');
const Ticket = require('../../models/LotteryTicket');

module.exports = {
  name: 'drawlottery',
  alias: ['cabut'],
  description: 'Cabut undi dan pilih pemenang dari semua tiket loteri',
  cooldown: 60,

  async execute(message) {
    // ✅ Hanya admin boleh cabut undi (ubah ID anda)
    const adminId = process.env.ADMIN_ID || 'YOUR_DISCORD_ID';
    if (message.author.id !== adminId) {
      return message.reply('Hanya admin boleh cabut undi!');
    }

    const allTickets = await Ticket.find();

    const pool = [];
    for (const ticket of allTickets) {
      for (let i = 0; i < ticket.count; i++) {
        pool.push(ticket.userId);
      }
    }

    if (pool.length === 0) {
      return message.channel.send('😢 Tiada tiket dalam cabutan loteri.');
    }

    const winnerId = pool[Math.floor(Math.random() * pool.length)];
    const prize = 500000; // Tetapkan hadiah (boleh ikut jumlah tiket juga jika mahu)

    const winner = await User.findOne({ userId: winnerId }) || await new User({ userId: winnerId, balance: 0 }).save();
    winner.balance += prize;
    await winner.save();

    await Ticket.deleteMany(); // Reset semua tiket

    return message.channel.send(`<@${winnerId}> memenangi loteri dan mendapat **$${prize} coins!**`);
  }
};