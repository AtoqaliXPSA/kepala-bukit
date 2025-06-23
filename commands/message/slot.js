const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['spin'],
  description: 'Main slot dan cuba menang coins',
  cooldown: 5,
  async execute(message, args) {
    const bet = parseInt(args[0]);
    const emojis = ['🍒', '🍋', '🔔', '💎', '🍇', '🍀'];

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Sila masukkan jumlah taruhan yang sah. Contoh: `!slot 100`');
    }

    const user = await User.findOne({ userId: message.author.id });
    if (!user || user.balance < bet) {
      return message.reply('❌ Anda tiada cukup duit untuk bertaruh.');
    }

    // Potong duit dulu
    user.balance -= bet;

    // Random hasil slot
    const slot = [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
    ];

    let result = '😢 Anda kalah!';
    let winnings = 0;

    if (slot[0] === slot[1] && slot[1] === slot[2]) {
      winnings = bet * 5;
      result = `🎉 Jackpot! Anda menang $${winnings}!`;
    } else if (slot[0] === slot[1] || slot[1] === slot[2] || slot[0] === slot[2]) {
      winnings = bet * 2;
      result = `✨ Menang kecil! Anda menang $${winnings}!`;
    }

    user.balance += winnings;
    await user.save();

    return message.reply(
      `🎰 | [ ${slot.join(' | ')} ]\n\n${result}\n💰 Baki anda: $${user.balance.toLocaleString()}`
    );
  }
};