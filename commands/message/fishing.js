const economy = require('../../utils/economy');
const cooldown = require ('../../utils/cooldownHelper');

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

    
    const cooldowned = await cooldown.checkCooldown(message, 'fishing', 3);
    if (cooldowned) return; // Sudah reply dalam fungsi checkCooldown

    // 🎣 Senarai ikan
    const fishOptions = [
      { name: '🐟 Ikan Bilis', chance: 0.6, value: 30 },
      { name: '🐠 Ikan Donny', chance: 0.03, value: 130 },
      { name: '🦈 Ikan Jering', chance: 0.009, value: 800 },
      { name: '🐋 Ikan Paus', chance: 0.0001, value: 1500 },
    ];

    // Pastikan jumlah peluang = 1.0
    const totalChance = fishOptions.reduce((acc, f) => acc + f.chance, 0);
    if (totalChance < 1) {
      fishOptions.push({ name: '🪱 Cacing Busuk', chance: 1 - totalChance, value: 0 });
    }

    // 🎲 Roll tangkapan
    const roll = Math.random();
    let cumulative = 0;
    let caught = fishOptions.find(fish => {
      cumulative += fish.chance;
      return roll <= cumulative;
    });

    if (!caught) caught = { name: '🪱 Cacing Busuk', value: 0 }; // Fallback

    // 💰 Beri coins jika berjaya
    let resultText = `🎣 Anda memancing dan dapat ${caught.name}!\n`;
    if (caught.value > 0) {
      await economy.addCoins(userId, caught.value);
      resultText += `\n💰 Anda mendapat **${caught.value} coins**!`;
    } else {
      resultText += `\n😢 Tiada hasil hari ini...`;
    }

    // 🪫 Papar stamina semasa
    const userData = await economy.getUserData(userId);
    const bar = getStaminaBar(userData.stamina);
    resultText += `\n\n**Stamina**: ${bar} \`${userData.stamina}/5\``;

    return message.reply(resultText);
  }
};