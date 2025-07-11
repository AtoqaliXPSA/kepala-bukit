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
      { name: '🐟 Ikan Bilis',  chance: 0.55,   value: 30  },
      { name: '🐠 Ikan Donny',  chance: 0.035,  value: 130 },
      { name: '🦈 Ikan Jering', chance: 0.009,  value: 800 },
      { name: '🐋 Ikan Paus',   chance: 0.001,  value: 1500 }
    ];

    // Fallback
    const total = fishOptions.reduce((a, f) => a + f.chance, 0);
    if (total < 1) fishOptions.push({ name: '🥾 Kasut Lama', chance: 1 - total, value: 0 });

    // Roll
    const roll = Math.random();
    let cum = 0;
    let caught = fishOptions.find(f => (cum += f.chance) >= roll) ||
                 { name: '🥾 Kasut Lama', value: 0 };

    // Kemas kini balance
    if (caught.value > 0) {
      await User.updateOne({ userId }, { $inc: { balance: caught.value } });
    }

    const reply =
      `Anda memancing dan dapat **${caught.name}**!\n` +
      (caught.value
        ? `Hasil: **${caught.value.toLocaleString()} coins**!`
        : 'Tiada hasil hari ini…');

    return message.reply(reply);
  }
};