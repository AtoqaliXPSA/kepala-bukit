const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['s'],
  description: 'Bermain slot',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]) || 1;

    const slotItems = [
      { symbol: '🍋', chance: 0.4, payout: 2 },
      { symbol: '🍒', chance: 0.03, payout: 3 },
      { symbol: '🔔', chance: 0.05, payout: 4 },
      { symbol: '🍓', chance: 0.01, payout: 5 },
      { symbol: '💎', chance: 0.001, payout: 10 },
      { symbol: '🍀', chance: 0.0001, payout: 20 }
    ];

    function rollSymbol() {
      const roll = Math.random();
      let total = 0;
      for (const item of slotItems) {
        total += item.chance;
        if (roll <= total) return item;
      }
      return slotItems[0]; // fallback
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));

    const user = await User.findOne({ userId: message.author.id }) ||
      await new User({ userId: message.author.id, balance: 500 }).save();

    if (user.balance < bet) {
      return message.reply(`Anda cuma ada ___***$${user.balance}***___ , tak cukup untuk taruhan **$${bet}**`);
    }

    user.balance -= bet;
    await user.save();

    const slot = [rollSymbol(), rollSymbol(), rollSymbol()];

    const slotBox = (s1, s2, s3, taruhan, result = '') => {
      return `\`\`\`
 DKB SLOT
┌───────────────┐
│ ${s1.symbol} │ ${s2.symbol} │ ${s3.symbol} │ Bet $${taruhan}
└───────────────┘
${result}\`\`\``;
    };

    const msg = await message.channel.send(slotBox({ symbol: '❓' }, { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], slot[2], bet));

    let winnings = 0;
    let resultText = '😢 You Lost!';

    if (slot[0].symbol === slot[1].symbol && slot[1].symbol === slot[2].symbol) {
      winnings = bet * slot[0].payout;
      resultText = `🎉 You Win $${winnings} with ${slot[0].symbol} x3!`;
    }

    user.balance += winnings;
    await user.save();

    const finalContent = slotBox(slot[0], slot[1], slot[2], bet, resultText);

    await delay(700);
    const sentMsg = await msg.edit({ content: finalContent });
  }
};