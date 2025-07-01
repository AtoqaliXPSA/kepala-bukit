const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['s'],
  description: 'Bermain slot dengan butang "Spin Lagi"',
  cooldown: 5,

  async execute(message, args) {
    const bet = parseInt(args[0]) || 1;

    const slotItems = [
      { symbol: '🍋', chance: 0.4, payout: 2 },
      { symbol: '🍒', chance: 0.3, payout: 3 },
      { symbol: '🔔', chance: 0.15, payout: 4 },
      { symbol: '💎', chance: 0.05, payout: 10 },
      { symbol: '🍓', chance: 0.07, payout: 5 },
      { symbol: '🍀', chance: 0.03, payout: 20 }
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
      return message.reply(`❌ Anda cuma ada $${user.balance}, tak cukup untuk taruhan $${bet}`);
    }

    user.balance -= bet;
    await user.save();

    const slot = [rollSymbol(), rollSymbol(), rollSymbol()];

    const slotBox = (s1, s2, s3, taruhan, result = '', balance = null) => {
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

    const finalContent = slotBox(slot[0], slot[1], slot[2], bet, resultText, user.balance);

    await delay(700);
    const sentMsg = await msg.edit({ content: finalContent, components: [row] });

    // ❌ Auto delete selepas 30 saat jika tiada tekan butang
    const collector = sentMsg.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 30000
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        try {
          await sentMsg.delete().catch(() => null);
        } catch {}
      }
    });
  }
};