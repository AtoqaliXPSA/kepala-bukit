const User = require('../../../models/User');

module.exports = {
  name: 'slot',
  alias: ['s'],
  description: 'Bermain slot',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]) || 1;

    const slotItems = [
      { symbol: '🍋', payout: 2 },
      { symbol: '🍒', payout: 3 },
      { symbol: '🔔', payout: 4 },
      { symbol: '🍓', payout: 5 },
      { symbol: '💎', payout: 10 },
      { symbol: '🍀', payout: 20 }
    ];

    const delay = ms => new Promise(res => setTimeout(res, ms));

    let user = await User.findOne({ userId: message.author.id });
    if (!user) {
      user = await new User({ userId: message.author.id, balance: 500, inventory: [] }).save();
    }

    if (user.balance < bet) {
      return message.reply(`You have ___***$${user.balance}***___ , to bet **$${bet}**`);
    }

    user.balance -= bet;
    await user.save();

    // **Check Luck Coin**
    let hasLuckCoin = false;
    let luckCoinIndex = -1;
    if (user.inventory && user.inventory.length > 0) {
      luckCoinIndex = user.inventory.findIndex(item =>
        (item.id && item.id.toLowerCase() === 'luck_coin') ||
        (item.name && item.name.toLowerCase() === 'luck coins')
      );
      hasLuckCoin = luckCoinIndex !== -1;
    }

    // 🎰 Logic Slot
    const mainSymbol = slotItems[Math.floor(Math.random() * slotItems.length)];

    let slot = [mainSymbol, mainSymbol, mainSymbol]; // default: full match

    // 🎯 Peluang full match
    let fullMatchChance = 0.05; // 5% default
    if (hasLuckCoin) fullMatchChance = 0.15; // boost ke 15%

    if (Math.random() > fullMatchChance) {
      // Guna slot rawak (tiada match)
      slot = [
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
      ];
    }

    const slotBox = (s1, s2, s3, taruhan, result = '') => {
      return `\`\`\`
   DKB SLOT
┌───────────────┐
│ ${s1.symbol} │ ${s2.symbol} │ ${s3.symbol} │ Bet $${taruhan}
└───────────────┘
${result}\`\`\``;
    };

    // Animasi slot
    const msg = await message.channel.send(slotBox({ symbol: '❓' }, { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], slot[2], bet));

    let winnings = 0;
    let resultText = '😢 You Lost!';

    if (slot[0].symbol === slot[1].symbol && slot[1].symbol === slot[2].symbol) {
      const payout = slot[0].payout;
      winnings = bet * payout;
      resultText = `🎉 You Win $${winnings} with ${slot[0].symbol} x3!${hasLuckCoin ? ' 🍀 (Luck Coin Boost!)' : ''}`;
    }

    user.balance += winnings;

    // **Jika ada Luck Coin, buang dari inventory**
    if (hasLuckCoin && luckCoinIndex !== -1) {
      user.inventory.splice(luckCoinIndex, 1);
    }

    await user.save();

    const finalContent = slotBox(slot[0], slot[1], slot[2], bet, resultText);
    await delay(700);
    await msg.edit({ content: finalContent });
  }
};