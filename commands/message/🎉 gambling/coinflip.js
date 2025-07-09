const User = require('../../../models/User');

module.exports = {
  name: 'cf',
  description: 'Coinflip taruhan',

  async execute(message, args) {
    const userId = message.author.id;

    // Ambil atau cipta pengguna
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 500 }); // default balance
    }

    const bet = Math.max(parseInt(args[0]) || 1, 1);
    if (bet > user.balance) {
      return message.reply(`Anda tiada cukup duit! Baki anda: ${user.balance}`);
    }

    // Coinflip animasi
    const msg = await message.reply('🪙 Coin sedang berpusing...');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = Math.random() < 0.5;

    setTimeout(async () => {
      if (win) {
        user.balance += bet;
        await user.save();
        msg.edit(`🎉 Anda menang! Coin: **${result}**\n💰 Duit anda: ${user.balance}`);
      } else {
        user.balance -= bet;
        await user.save();
        msg.edit(`Anda kalah. Coin: **${result}**\n💸 Duit anda: ${user.balance}`);
      }
    }, 2000);
  }
};