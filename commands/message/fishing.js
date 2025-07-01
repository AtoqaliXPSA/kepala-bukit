const economy = require('../../utils/economy');

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

    // ❌ Cek stamina
    const hasStamina = await economy.useStamina(userId);
    if (!hasStamina) {
      return message.reply('❌ Anda keletihan. Tunggu stamina pulih untuk memancing semula.');
    }

    // 🎣 Random ikan
    const fishOptions = [
      { name: '🐟 Ikan Bilis', chance: 0.6, value: 30 },
      { name: '🐠 Ikan Donny', chance: 0.03, value: 130 },
      { name: '🦈 Ikan Jering', chance: 0.009, value: 800 },
      { name: '🐋 Ikan Paus', chance: 0.0001, value: 1500 },
    ];

    const roll = Math.random();
    let caught = fishOptions.find((f, i, arr) => {
      const totalChance = arr.slice(0, i + 1).reduce((acc, f) => acc + f.chance, 0);
      return roll <= totalChance;
    });

    let resultText = `🎣 Anda memancing dan dapat ${caught.name}!`;
    if (caught.value > 0) {
      await economy.addCoins(userId, caught.value);
      resultText += `\n💰 Anda mendapat **${caught.value} coins**!`;
    } else {
      resultText += `\n😢 Tiada hasil hari ini...`;
    }

    const userData = await economy.getUserData(userId);
    const bar = getStaminaBar(userData.stamina);
    resultText += `\n\n**Stamina**: ${bar} \`${userData.stamina}/5\``;

    return message.reply(resultText);
  }
};
