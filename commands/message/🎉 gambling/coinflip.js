const User = require('../../../models/User');

module.exports = {
  name: 'coinflip',
  alias: ['cf', 'flip'],
  description: 'Bet coinsflip.',
  cooldown: 6,

  async execute(message, args) {
    if (args.length < 2) {
      return message.reply('Please choose and insert amount to bet.');
    }

    const choice = args[0].toLowerCase();
    if (!['head', 'tail'].includes(choice)) {
      return message.reply('Please choose `head` or `tail`.');
    }

    const bet = parseInt(args[1]);
    if (isNaN(bet) || bet <= 0) {
      return message.reply('Please enter a valid bet amount.');
    }

    // Cari user
    const userId = message.author.id;
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, inventory: [] });
    }

    if (user.balance < bet) {
      return message.reply(`You don't have enough coins. Your balance: **${user.balance}**.`);
    }

    // Animasi coinflip
    const animMsg = await message.reply(`🪙 Flipping the coin... **${choice.toUpperCase()}**?`);
    await new Promise(res => setTimeout(res, 2000)); // 2 saat delay

    // Hasil random
    const result = Math.random() < 0.5 ? 'head' : 'tail';
    let outcome = `The coin landed on **${result.toUpperCase()}**. `;

    if (result === choice) {
      const winAmount = bet * 2;
      user.balance += bet; // menang = dapat balik taruhan + untung
      await user.save();
      outcome += `You win **${winAmount} coins**!`;
    } else {
      user.balance -= bet;
      await user.save();
      outcome += `You lost **${bet} coins**<:Djcoins_6:1402689800267632690>.`;
    }

    animMsg.edit(outcome);
  }
};