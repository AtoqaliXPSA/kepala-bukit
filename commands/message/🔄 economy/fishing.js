const User = require('../../../models/User');

module.exports = {
  name: 'fishing',
  alias: ['fish'],
  description: 'Pancing ikan dan dapatkan duit!',
  cooldown: 5,

  async execute(message) {
    const userId = message.author.id;

    // 🎣 Senarai ikan & peluang
    const fishOptions = [
      { name: '🐟 Ikan Bilis', chance: 0.6, value: 30 },
      { name: '🐠 Ikan Donny', chance: 0.003, value: 130 },
      { name: '🦈 Ikan Jering', chance: 0.0009, value: 800 },
      { name: '🐋 Ikan Paus', chance: 0.00001, value: 1500 },
    ];

    const totalChance = fishOptions.reduce((acc, f) => acc + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🥾 Kasut Lama', chance: 1 - totalChance, value: 0 });
    }

    const roll = Math.random();
    let cumulative = 0;
    let caught = fishOptions.find(fish => {
      cumulative += fish.chance;
      return roll <= cumulative;
    });

    if (!caught) caught = { name: '🥾 Kasut Lama', value: 0 };

    let resultText = `Anda memancing dan dapat ___**${caught.name}**___!\n`;

    if (caught.value > 0) {
      await User.findOneAndUpdate(
        { userId },
        { $inc: { coins: caught.value } },
        { upsert: true, new: true }
      );
      resultText += `Anda mendapat **${caught.value} coins** !`;
    } else {
      resultText += `Tiada hasil hari ini...`;
    }

    return message.reply(resultText);
  }
};