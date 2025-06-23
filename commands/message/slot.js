const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['s'],
  description: 'Mesin slot DJ Kepalabukit!',
  cooldown: 1,

  async execute(message, args) {
    const bet = parseInt(args[0]) || 1;
    const emojis = ['🍒', '🍋', '🔔', '💎', '🍇', '🍀'];
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const user = await User.findOne({ userId: message.author.id }) ||
      await new User({ userId: message.author.id, balance: 500 }).save();

    if (user.balance < bet) {
      return message.reply(`❌ Anda cuma ada $${user.balance}, tak cukup untuk taruhan $${bet}`);
    }

    user.balance -= bet;
    await user.save();

    const randomSlot = () => emojis[Math.floor(Math.random() * emojis.length)];
    const slot = [randomSlot(), randomSlot(), randomSlot()];

    const slotBox = (s1, s2, s3, taruhan, result = '') => {
      return `\`\`\`
 DKB SLOT
┌───────────────┐
│ ${s1} │ ${s2} │ ${s3} │ Bet $${taruhan}
└───────────────┘
${result}
\`\`\``;
    };

    const msg = await message.channel.send(slotBox('❓', '❓', '❓', bet));
    await delay(500); await msg.edit(slotBox(slot[0], '❓', '❓', bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], '❓', bet));
    await delay(500); await msg.edit(slotBox(...slot, bet));

    let winnings = 0;
    let resultText = 'You Lost!';

    const isTriple = slot[0] === slot[1] && slot[1] === slot[2];
    if (isTriple) {
      winnings = slot[0] === '💎' ? bet * 10 : bet * 5;
      resultText = `You Win $${winnings}!`;
    }

    user.balance += winnings;
    await user.save();

    await delay(700);
    await msg.edit(slotBox(...slot, bet, winnings > 0 ? resultText : 'You Lost!'));
  }
};