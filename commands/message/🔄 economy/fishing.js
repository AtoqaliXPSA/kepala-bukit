const { checkCooldown } = require('../../../helper/cooldownHelper');
const User = require('../../../models/User');

module.exports = {
  name: 'fishing',
  alias: ['fish'],
  description: 'Pancing ikan dan dapatkan duit!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;

    // ⏳ Cool-down 5s
    if (await checkCooldown(message, 'fishing', 5)) return;

    // Pastikan dokumen wujud
    await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { upsert: true }
    );

    // 🎣 Senarai ikan
    const fishOptions = [
      { name: '🐟 sardines',  chance: 0.55,   value: 30  },
      { name: '🐠 Donny',  chance: 0.035,  value: 130 },
      { name: '🦈 Shark', chance: 0.009,  value: 800 },
      { name: '🐋 Whale',   chance: 0.001,  value: 1500 }
    ];

    // Fallback
    const total = fishOptions.reduce((a, f) => a + f.chance, 0);
    if (total < 1) fishOptions.push({ name: '🥾 Torn shoes', chance: 1 - total, value: 0 });

    // Roll
    const roll = Math.random();
    let cum = 0;
    let caught = fishOptions.find(f => (cum += f.chance) >= roll) ||
                 { name: '🥾 Torn shoes', value: 0 };

    // Kemas kini balance
    if (caught.value > 0) {
      await User.updateOne({ userId }, { $inc: { balance: caught.value } });
    }

    const reply =
      `Fishing and get **${caught.name}**!\n` +
      (caught.value
        ? `Get : **${caught.value.toLocaleString()} coins**!`
        : 'No catch today…');

    return message.reply(reply);
  }
};