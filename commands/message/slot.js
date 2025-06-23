const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['spin'],
  description: '🎰 Main slot dan cuba menang coins',
  cooldown: 10,
  async execute(message, args) {
    const bet = parseInt(args[0]) || 1; // 0 jika tiada args
    const emojis = ['🍒', '🍋', '🔔', '💎', '🍇', '🍀'];
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const user = await User.findOne({ userId: message.author.id }) ||
      await new User({ userId: message.author.id, balance: 500 }).save();

    if (user.balance < bet) {
      return message.reply(`❌ Anda cuma ada $${user.balance}, tak cukup untuk bertaruh $${bet}`);
    }

    user.balance -= bet;
    await user.save();

    const slot = [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
    ];

    const slotBox = (s1 = '❓', s2 = '❓', s3 = '❓') => {
      return `\`\`\`
___SLOT___
┌─────────────┐
│ ${s1} │ ${s2} │ ${s3}│
└─────────────┘
\`\`\``;
    };

    const msg = await message.channel.send(`🎰 Taruhan: $${bet}\n${slotBox()}`);

    // "Animasi" 3 peringkat
    await delay(600); await msg.edit(`🎰 Taruhan: $${bet}\n${slotBox(slot[0], '❓', '❓')}`);
    await delay(600); await msg.edit(`🎰 Taruhan: $${bet}\n${slotBox(slot[0], slot[1], '❓')}`);
    await delay(600); await msg.edit(`🎰 Taruhan: $${bet}\n${slotBox(...slot)}`);

    // Menilai kemenangan
    let winnings = 0;
    let resultText = '😢 Anda kalah.';

    if (slot[0] === slot[1] && slot[1] === slot[2]) {
      winnings = bet * 5;
      resultText = `🎉 JACKPOT! Anda menang $${winnings}!`;
    } else if (slot[0] === slot[1] || slot[1] === slot[2] || slot[0] === slot[2]) {
      winnings = bet * 2;
      resultText = `✨ Menang kecil! Anda menang $${winnings}`;
    }

    user.balance += winnings;
    await user.save();

    await delay(800);
    await msg.edit(
      `🎰 Taruhan: $${bet}\n${slotBox(...slot)}\n${resultText}\n💰 Baki: $${user.balance}`
    );
  }
};