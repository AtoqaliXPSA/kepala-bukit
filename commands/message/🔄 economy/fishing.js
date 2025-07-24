const User = require('../../../models/User');
const fs = require('fs');
const path = require('path');

// Load items.json
const itemsPath = path.join(__dirname, '../../../data/items.json');
const shopItems = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

module.exports = {
  name: 'fishing',
  alias: ['fish', 'catch'],
  description: 'Pancing ikan dan dapatkan duit!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;

    // Pastikan user wujud
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, balance: 0, inventory: [] });
    }

    /* ── Cari Fishing Rod ── */
    const rodItem = shopItems.find(
      i => i.id.toLowerCase() === 'fishing_rod' || i.alias?.includes('rod')
    );
    let rodIndex = user.inventory.findIndex(inv => {
      const invName = (inv.name || inv).toLowerCase();
      return invName === rodItem.name.toLowerCase() || rodItem.alias?.includes(invName);
    });
    const hasRod = rodIndex !== -1;

    /* ── Senarai ikan ── */
    const fishOptions = [
      { name: '🐟 Sardine', chance: 0.55,  minKg: 0.01, maxKg: 0.4,  price: 60  },
      { name: '🐠 Donny',   chance: 0.035, minKg: 0.4,  maxKg: 1.2,  price: 110 },
      { name: '🦈 Shark',   chance: 0.009, minKg: 10,   maxKg: 60,   price: 30  },
      { name: '🐋 Whale',   chance: 0.001, minKg: 100,  maxKg: 250,  price: 15  }
    ];

    // Bonus kalau ada rod
    if (hasRod) {
      fishOptions.forEach(fish => {
        if (fish.name === '🦈 Shark') fish.chance *= 1.5;
        if (fish.name === '🐋 Whale') fish.chance *= 2;
      });
    }

    // Fallback sampah
    const totalChance = fishOptions.reduce((s, f) => s + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🥾 Torn shoes', chance: 1 - totalChance, minKg: 0, maxKg: 0, price: 0 });
    }

    // Roll
    const roll = Math.random();
    let acc = 0;
    let caught = fishOptions.find(f => (acc += f.chance) >= roll);

    // Berat & reward
    let weightKg = +(Math.random() * (caught.maxKg - caught.minKg) + caught.minKg).toFixed(2);
    if (caught.price === 0) weightKg = 0;

    let reward = Math.round(weightKg * caught.price);
    if (hasRod && reward > 0) {
      reward = Math.round(reward * 1.3); // +30% coins
    }

    /* ── Update DB ── */
    const updateData = {};
    if (reward > 0) updateData.$inc = { balance: reward };
    if (hasRod) updateData.$pull = { inventory: user.inventory[rodIndex] };

    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ userId }, updateData);
    }

    /* ── Reply ── */
    const rodMessage = hasRod ? '\n**Your Fishing Rod broke after this trip.**' : '';
    const reply =
      `**${message.author.username}** goes fishing...\n` +
      `You caught **${caught.name}** ${weightKg ? `(Weight: **${weightKg}KG**)` : ''}\n` +
      (reward
        ? `Reward: **${reward.toLocaleString()} coins** ${hasRod ? '*(+rod bonus)*' : ''}`
        : 'Nothing valuable today...') +
      rodMessage;

    message.reply(reply);
  }
};