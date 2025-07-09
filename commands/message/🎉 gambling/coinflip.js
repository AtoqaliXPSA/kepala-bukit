const User = require('../../../models/User');

module.exports = {
  name: 'coinflip',
  description: 'Coinflip taruhan',
  alias: ['cf'],
  cooldown: 5,

  async execute(message, args) {
    const userId = message.author.id;

    // 📦 Cari user atau cipta
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 500 }); // default balance
    }

    // 🎯 Semak input
    const bet = Math.max(parseInt(args[0]) || 1, 1);
    const choice = args[1]?.toLowerCase();

    if (!['heads', 'tails'].includes(choice)) {
      return message.reply('Sila pilih `heads` atau `tails`.');
    }

    if (bet > user.balance) {
      return message.reply(`Duit tak cukup! Baki anda: ${user.balance}`);
    }

    // 🌀 Animasi & flip
    const flipMsg = await message.reply('🪙 Coin sedang berpusing...');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === choice;

    setTimeout(async () => {
      if (isWin) {
        user.balance += bet;
        await user.save();
        flipMsg.edit(`🎉 Anda menang! (anda pilih: ***${choice}***)`);
      } else {
        user.balance -= bet;
        await user.save();
        flipMsg.edit(`Anda kalah. (anda pilih: ***${choice}***)`);
      }
    }, 2000);
  }
};