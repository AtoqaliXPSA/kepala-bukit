const { checkCooldown } = require('../../../helper/cooldownHelper');
const User = require('../../../models/User');

module.exports = {
  name: 'fishing',
  alias: ['fish','catch'],
  description: 'Pancing ikan dan dapatkan duit!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;

    /* ── Cool-down ── */
    if (await checkCooldown(message, 'fishing', 5)) return;

    await User.findOneAndUpdate(
      { userId },
      { $setOnInsert: { balance: 0 } },
      { upsert: true }
    );

    /* ── Senarai ikan ── */
    const fishOptions = [
      { name: '🐟 Sardine', chance: 0.55,  minKg: 0.01, maxKg: 0.04,  price: 60  },  // ≈6 coin /100 g
      { name: '🐠 Donny',   chance: 0.035, minKg: 0.4, maxKg: 1.2,  price: 110 },
      { name: '🦈 Shark',   chance: 0.009, minKg: 10,  maxKg: 60,   price: 30  },
      { name: '🐋 Whale',   chance: 0.001, minKg: 100, maxKg: 250,  price: 15  }
    ];

    /* ── Fallback “sampah” ── */
    const totalChance = fishOptions.reduce((s, f) => s + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🥾 Torn shoes', chance: 1 - totalChance, minKg: 0, maxKg: 0, price: 0 });
    }

    /* ── Roll ── */
    const roll = Math.random();
    let acc  = 0;
    let caught = fishOptions.find(f => (acc += f.chance) >= roll);

    /* ── Berat & nilai ── */
    let weightKg = +(Math.random() * (caught.maxKg - caught.minKg) + caught.minKg).toFixed(2);
    if (caught.price === 0) weightKg = 0;

    const reward = Math.round(weightKg * caught.price);

    if (reward) {
      await User.updateOne({ userId }, { $inc: { balance: reward } });
    }

    /* ── Reply ── */
    const reply =
      `You get **${caught.name}** ${weightKg ? `heavy is **${weightKg}KG**` : ''}!\n` +
      (reward
        ? `Reward: **${reward.toLocaleString()} coins**`
        : 'Catch nothing today...');

    message.reply(reply);
  }
};