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
    const choice = args[0]?.toLowerCase();
    const bet = Math.max(parseInt(args[1]) || 1, 1);

    if (!['heads', 'tails'].includes(choice)) {
      return message.reply('Please choose `heads` or `tails`.');
    }

    if (bet > user.balance) {
      return message.reply(`Enough Money! Balance: ${user.balance}`);
    }

    // 🌀 Animasi & flip
    const flipMsg = await message.reply('🪙 Coin is rolling...');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === choice;

    setTimeout(async () => {
      if (isWin) {
        user.balance += bet;
        await user.save();
        flipMsg.edit(`You win! (you choose: ***${choice}*** - You Win: **${isWin}**)`);
      } else {
        user.balance -= bet;
        await user.save();
        flipMsg.edit(`You lose. (you choose: ***${choice}***) - You Win: **${bet}**)`);
      }
    }, 2000);
  }
};