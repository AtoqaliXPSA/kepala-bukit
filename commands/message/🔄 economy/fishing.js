const User = require('../../../models/User');

module.exports = {
  name: 'fishing',
  alias: ['fish', 'catch'],
  description: 'Pancing ikan dan dapatkan duit!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, inventory: [] });
    }

    // Check if user has Fishing Rod
    const hasRod = user.inventory?.some(item => 
      (item.name || item).toLowerCase() === 'fishing rod'
    );

    /* ── Senarai ikan ── */
    const fishOptions = [
      { name: '🐟 Sardine', chance: 0.55,  minKg: 0.01, maxKg: 0.4,  price: 60  },
      { name: '🐠 Donny',   chance: 0.035, minKg: 0.4,  maxKg: 1.2,  price: 110 },
      { name: '🦈 Shark',   chance: 0.009, minKg: 10,   maxKg: 60,   price: 30  },
      { name: '🐋 Whale',   chance: 0.001, minKg: 100,  maxKg: 250,  price: 15  }
    ];

    /* ── Jika ada rod, boost chance ikan rare & harga ── */
    if (hasRod) {
      fishOptions.forEach(fish => {
        // boost 50% untuk ikan mahal sahaja
        if (['donny', 'shark', 'whale'].includes(fish.name.toLowerCase().split(' ')[1])) {
          fish.chance *= 1.5; 
        }
        fish.price = Math.round(fish.price * 1.3); // Semua ikan harga naik 30%
      });
    }

    /* ── Fallback “sampah” ── */
    const totalChance = fishOptions.reduce((s, f) => s + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🥾 Torn shoes', chance: 1 - totalChance, minKg: 0, maxKg: 0, price: 0 });
    }

    /* ── Roll ── */
    const roll = Math.random();
    let acc = 0;
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
      `You caught **${caught.name}**${weightKg ? `, weighing **${weightKg}KG**` : ''}!\n` +
      (reward
        ? `Reward: **${reward.toLocaleString()} coins**${hasRod ? ' (Bonus from Fishing Rod!)' : ''}`
        : 'Catch nothing today...');

    message.reply(reply);
  }
};