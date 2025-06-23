const User = require('../../models/User');

module.exports = {
  name: 'slot',
  alias: ['spin'],
  description: '🎰 Main mesin slot dan menang coins!',
  cooldown: 10,
  async execute(message, args) {
    const bet = parseInt(args[0]) || 1;
    const emojis = ['🍒', '🍋', '🔔', '💎', '🍇', '🍀'];
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const user = await User.findOne({ userId: message.author.id }) ||
      await new User({ userId: message.author.id, balance: 500 }).save();

    if (bet < 1 || isNaN(bet)) return message.reply('❌ Masukkan jumlah taruhan yang sah.');
    if (user.balance < bet) return message.reply(`❌ Baki tidak mencukupi. Anda ada $${user.balance}.`);

    user.balance -= bet;
    await user.save();

    const randomSlot = () => emojis[Math.floor(Math.random() * emojis.length)];
    const slot = [randomSlot(), randomSlot(), randomSlot()];

    const slotBox = (s1 = '❓', s2 = '❓', s3 = '❓') => {
      return `\`\`\`
 DJ KEPALA SLOT 
┌───────────────┐
│ ${s1} │ ${s2} │ ${s3} │
└───────────────┘
\`\`\``;
    };

    const msg = await message.channel.send(`💸 Taruhan: $${bet}\n${slotBox()}`);

    await delay(600); await msg.edit(`💸 Taruhan: $${bet}\n${slotBox(slot[0], '❓', '❓')}`);
    await delay(600); await msg.edit(`💸 Taruhan: $${bet}\n${slotBox(slot[0], slot[1], '❓')}`);
    await delay(600); await msg.edit(`💸 Taruhan: $${bet}\n${slotBox(...slot)}`);

    let winnings = 0;
    let resultText = '😢 Anda kalah. Cuba lagi!';

    const isTriple = slot[0] === slot[1] && slot[1] === slot[2];
    const isDouble = slot[0] === slot[1] || slot[1] === slot[2] || slot[0] === slot[2];

    if (isTriple) {
      winnings = slot[0] === '💎' ? bet * 10 : bet * 5;
      resultText = `🎉 JACKPOT! Anda menang $${winnings}!`;
    } else if (isDouble) {
      winnings = bet * 2;
      resultText = `✨ Menang kecil! Anda menang $${winnings}.`;
    }

    user.balance += winnings;
    await user.save();

    await delay(800);
    await msg.edit(
      `💸 Taruhan: $${bet}\n${slotBox(...slot)}\n${resultText}\n💰 Baki semasa: $${user.balance}`
    );
  }
};