module.exports = {
  name: 'drawlottery',
  description: 'Cabut pemenang loteri (admin sahaja)',

  async execute(message) {
    if (message.author.id !== process.env.ADMIN_ID) return message.reply('Hanya admin boleh buat cabutan.');

    if (tickets.size === 0) return message.channel.send('Tiada peserta untuk cabutan loteri.');

    // Kumpulkan semua tiket
    let pool = [];
    tickets.forEach((count, userId) => {
      for (let i = 0; i < count; i++) pool.push(userId);
    });

    // Pilih secara rawak
    const winnerId = pool[Math.floor(Math.random() * pool.length)];
    const winner = await User.findOne({ userId: winnerId });
    winner.balance += lotteryPool;
    await winner.save();

    // Reset
    tickets.clear();
    const wonAmount = lotteryPool;
    lotteryPool = 0;

    return message.channel.send(`Tahniah <@${winnerId}>! Anda menang **$${wonAmount}** daripada cabutan loteri!`);
  }
};