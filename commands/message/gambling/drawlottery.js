const User = require('../../models/User');
const Ticket = require('../../models/LotteryTicket');

module.exports = {
  name: 'drawlottery',
  alias: ['cabutundi'],
  description: 'Cabut undi dan pilih pemenang dari semua tiket loteri',
  cooldown: 60,

  async execute(message) {
    // ✅ Hanya admin boleh cabut undi
    const adminId = process.env.ADMIN_ID || 'YOUR_DISCORD_ID';
    if (message.author.id !== adminId) {
      return message.reply('Hanya admin boleh cabut undi!');
    }

    const allTickets = await Ticket.find();
    const ticketPrice = 10000;
    const pool = [];

    let totalTickets = 0;
    for (const ticket of allTickets) {
      for (let i = 0; i < ticket.count; i++) {
        pool.push(ticket.userId);
      }
      totalTickets += ticket.count;
    }

    if (pool.length === 0) {
      return message.channel.send('Tiada tiket dalam cabutan loteri.');
    }

    // 🎯 Pilih pemenang rawak
    const winnerId = pool[Math.floor(Math.random() * pool.length)];

    // 🏆 Kira hadiah berdasarkan jumlah tiket
    const prize = totalTickets * ticketPrice;

    // 💰 Tambah hadiah ke akaun pemenang
    const winner = await User.findOne({ userId: winnerId }) || await new User({ userId: winnerId, balance: 0 }).save();
    winner.balance += prize;
    await winner.save();

    // ❌ Kosongkan tiket selepas draw
    await Ticket.deleteMany();

    return message.channel.send(
      `<@${winnerId}> memenangi **Loteri DKB**!\n` +
      `Hadiah: **$${prize} coins**\n` +
      `Jumlah tiket: **${totalTickets}** dari semua peserta.`
    );
  }
};