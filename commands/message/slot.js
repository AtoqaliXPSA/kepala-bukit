const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['s'],
  description: '🎰 Mesin slot DJ Kepalabukit!',
  cooldown: 10,

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

    const slotUI = (s1, s2, s3, bet, result = '') => {
      return `\`\`\`
🎰 DJ KEPALABUKIT SLOT 🎰
┌─────────┬─────────┬─────────┐
│   ${s1}   │   ${s2}   │   ${s3}   │
└─────────┴─────────┴─────────┘
Taruhan: $${bet}
${result}
\`\`\``;
    };

    const msg = await message.channel.send(slotUI('❓', '❓', '❓', bet));
    await delay(500); await msg.edit(slotUI(slot[0], '❓', '❓', bet));
    await delay(500); await msg.edit(slotUI(slot[0], slot[1], '❓', bet));
    await delay(500); await msg.edit(slotUI(...slot, bet));

    // Penilaian
    let winnings = 0;
    let resultText = '';

    const isTriple = slot[0] === slot[1] && slot[1] === slot[2];
    if (isTriple) {
      winnings = slot[0] === '💎' ? bet * 10 : bet * 5;
      resultText = `🎉 **JACKPOT!** Anda menang $${winnings}!`;
    }

    user.balance += winnings;
    await user.save();

    await delay(700);
    await msg.edit(slotUI(...slot, bet, winnings > 0 ? resultText : ''));
  }
};