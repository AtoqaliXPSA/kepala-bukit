const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const User = require('../models/User');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // ✅ Hanya proses button "Spin Lagi"
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    // 🎰 Spin Lagi handler
    if (customId.startsWith('spin_again_')) {
      const [_, userId, bet] = customId.split('_');
      if (interaction.user.id !== userId) {
        return interaction.reply({ content: '❌ Ini bukan button anda.', ephemeral: true });
      }

      const user = await User.findOne({ userId });
      const parsedBet = parseInt(bet);

      if (!user || user.balance < parsedBet) {
        return interaction.reply({ content: '❌ Anda tiada balance mencukupi.', ephemeral: true });
      }

      // 🎰 Sistem Slot
      const slotItems = [
        { symbol: '🍋', chance: 0.4, payout: 3 },
        { symbol: '🍒', chance: 0.3, payout: 4 },
        { symbol: '🔔', chance: 0.15, payout: 6 },
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
        return slotItems[0];
      }

      const delay = ms => new Promise(res => setTimeout(res, ms));
      user.balance -= parsedBet;
      await user.save();

      const slot = [rollSymbol(), rollSymbol(), rollSymbol()];
      const slotBox = (s1, s2, s3, taruhan, result = '') => {
        return `\`\`\`
 DKB SLOT
┌───────────────┐
│ ${s1.symbol} │ ${s2.symbol} │ ${s3.symbol} │ Bet $${taruhan}
└───────────────┘
${result}
\`\`\``;
      };

      const msg = await interaction.reply({
        content: slotBox({ symbol: '❓' }, { symbol: '❓' }, { symbol: '❓' }, parsedBet),
        fetchReply: true
      });

      await delay(500); await msg.edit(slotBox(slot[0], { symbol: '❓' }, { symbol: '❓' }, parsedBet));
      await delay(500); await msg.edit(slotBox(slot[0], slot[1], { symbol: '❓' }, parsedBet));
      await delay(500); await msg.edit(slotBox(...slot, parsedBet));

      let winnings = 0;
      let resultText = '😢 You Lost!';
      const isTriple = slot[0].symbol === slot[1].symbol && slot[1].symbol === slot[2].symbol;

      if (isTriple) {
        winnings = parsedBet * slot[0].payout;
        resultText = `🎉 You Win $${winnings} with ${slot[0].symbol} x3!`;
      }

      user.balance += winnings;
      await user.save();
      await delay(700);

      // Butang Spin Lagi
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`spin_again_${userId}_${parsedBet}`)
          .setLabel('🎰 Spin Lagi')
          .setStyle(ButtonStyle.Success)
      );

      await msg.edit({ content: slotBox(...slot, parsedBet, resultText), components: [row] });

      // Auto delete lepas 30 saat
      const collector = msg.createMessageComponentCollector({
        time: 30000,
        filter: i => i.user.id === userId
      });

      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          try {
            await msg.delete().catch(() => null);
          } catch {}
        }
      });

      return;
    }
  }
};