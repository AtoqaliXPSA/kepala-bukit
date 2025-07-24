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

    // Cari Fishing Rod dalam inventory
    let rodIndex = user.inventory.findIndex(item => 
      item.id && item.id.toLowerCase() === 'fishing_rod'
    );

    const hasRod = rodIndex !== -1;

    /* ── Senarai ikan ── */
    const fishOptions = [
      { name: '🐟 Sardine', chance: 0.55,  minKg: 0.01, maxKg: 0.4,  price: 60  },
      { name: '🐠 Donny',   chance: 0.035, minKg: 0.4,  maxKg: 1.2,  price: 110 },
      { name: '🦈 Shark',   chance: 0.009, minKg: 10,   maxKg: 60,   price: 30  },
      { name: '🐋 Whale',   chance: 0.001, minKg: 100,  maxKg: 250,  price: 15  }
    ];

    /* ── Boost jika ada rod ── */
    if (hasRod) {
      fishOptions.forEach(fish => {
        if (['donny', 'shark', 'whale'].includes(fish.name.toLowerCase().split(' ')[1])) {
          fish.chance *= 1.5; // 50% boost rare
        }
        fish.price = Math.round(fish.price * 1.3); // Semua ikan +30% harga
      });

      // Kurangkan durability rod
      if (user.inventory[rodIndex].durability !== undefined) {
        user.inventory[rodIndex].durability -= 1;
        if (user.inventory[rodIndex].durability <= 0) {
          message.channel.send('Your **Fishing Rod** has broken!');
          user.inventory.splice(rodIndex, 1); // Buang rod
        }
      }
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
      await User.updateOne({ userId }, { $inc: { balance: reward }, $set: { inventory: user.inventory } });
    } else {
      await User.updateOne({ userId }, { $set: { inventory: user.inventory } });
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