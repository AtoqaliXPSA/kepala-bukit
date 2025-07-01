const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require('discord.js');
const User = require('../models/User');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const [action, targetId, betStr] = customId.split('_');

    if (action !== 'spin' || interaction.user.id !== targetId) return;

    const bet = parseInt(betStr);
    if (isNaN(bet) || bet <= 0) {
      return interaction.reply({ content: '❌ Taruhan tidak sah.', flag: 64 });
    }

    // Cari user
    const user = await User.findOne({ userId: targetId });
    if (!user) {
      return interaction.reply({ content: '❌ User tidak dijumpai.', flag: 64 });
    }

    if (user.balance < bet) {
      return interaction.reply({ content: `❌ Anda hanya ada $${user.balance}, tak cukup untuk taruhan $${bet}.`, flag: 64 });
    }

    user.balance -= bet;
    await user.save();

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
      return slotItems[0]; // fallback
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));
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

    await interaction.deferReply(); // ACK untuk elak error

    const msg = await interaction.editReply(slotBox({ symbol: '❓' }, { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], { symbol: '❓' }, { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(slot[0], slot[1], { symbol: '❓' }, bet));
    await delay(500); await msg.edit(slotBox(...slot, bet));

    let winnings = 0;
    let resultText = '😢 You Lost!';
    const isTriple = slot[0].symbol === slot[1].symbol && slot[1].symbol === slot[2].symbol;
    if (isTriple) {
      winnings = bet * slot[0].payout;
      resultText = `🎉 You Win $${winnings} with ${slot[0].symbol} x3!`;
    }

    user.balance += winnings;
    await user.save();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`spin_${interaction.user.id}_${bet}`)
        .setLabel('🎰 Spin Lagi')
        .setStyle(ButtonStyle.Success)
    );

    await delay(700);
    await msg.edit({ content: slotBox(...slot, bet, resultText), components: [row] });

    // ⏳ Auto-delete jika user tak tekan dalam 30s
    const collector = msg.createMessageComponentCollector({
      time: 30000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        try {
          await msg.delete();
        } catch {}
      }
    });
  }
};