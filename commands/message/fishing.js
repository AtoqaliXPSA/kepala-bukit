const { EmbedBuilder } = require('discord.js');
const economy = require('../../helpers/economy');

module.exports = {
  name: 'fish',
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
      { name: '🐟 Ikan Selar', chance: 0.6, value: 50 },
      { name: '🐠 Ikan Toman', chance: 0.3, value: 150 },
      { name: '🦈 Ikan Jerung', chance: 0.09, value: 500 },
      { name: '🪤 Sampah Tersangkut', chance: 0.01, value: 0 },
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
    resultText += `\n⚡ Stamina baki: **${userData.stamina}/5**`;

    const embed = new EmbedBuilder()
      .setTitle('Fishing Game 🎣')
      .setDescription(resultText)
      .setColor(caught.value === 0 ? 'Red' : 'Blue')
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });

    message.reply({ embeds: [embed] });
  }
};