const economy = require('../../utils/economy');
const cooldown = require('../../utils/cooldownHelper');

function getStaminaBar(current, max = 5) {
  const full = '▓'.repeat(current);
  const empty = '░'.repeat(max - current);
  return full + empty;
}

module.exports = {
  name: 'fishing',
  alias: ['fish'],
  description: 'Pancing ikan dan dapatkan duit!',

  async execute(message) {
    const userId = message.author.id;

    // ⏳ Cooldown: 3 saat
    const cooldowned = await cooldown.checkCooldown(message, 'fishing', 3);
    if (cooldowned) return;

    // ⚡ Gunakan 1 stamina dahulu
    const used = await economy.useStamina(userId);
    if (!used) {
      return message.reply('***Anda keletihan***. Stamina akan ditambah setiap 5 mins.');
    }

    // 🎣 Senarai ikan & peluang
    const fishOptions = [
      { name: '🐟 Ikan Bilis', chance: 0.6, value: 30 },
      { name: '🐠 Ikan Donny', chance: 0.03, value: 130 },
      { name: '🦈 Ikan Jering', chance: 0.009, value: 800 },
      { name: '🐋 Ikan Paus', chance: 0.0001, value: 1500 },
    ];

    // Tambah fallback ikan busuk
    const totalChance = fishOptions.reduce((acc, f) => acc + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🥾 Kasut Lama', chance: 1 - totalChance, value: 0 });
    }

    // 🎲 Roll nasib
    const roll = Math.random();
    let cumulative = 0;
    let caught = fishOptions.find(fish => {
      cumulative += fish.chance;
      return roll <= cumulative;
    });

    if (!caught) caught = { name: '🥾 Kasut Lama', value: 0 };

    // 💸 Tambah coins jika dapat ikan berharga
    let resultText = `🎣 Anda memancing dan dapat ${caught.name}!\n`;
    if (caught.value > 0) {
      await economy.addCoins(userId, caught.value);
      resultText += `\n💰 Anda mendapat **${caught.value} coins**!`;
    } else {
      resultText += `\n😢 Tiada hasil hari ini...`;
    }

    // ⚡ Papar stamina semasa
    const userData = await economy.getUserData(userId);
    const bar = getStaminaBar(userData.stamina);
    resultText += `\n\n**Stamina**: ${bar} \`${userData.stamina}/5\``;

    return message.reply(resultText);
  }
};