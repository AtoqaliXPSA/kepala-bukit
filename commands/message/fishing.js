const { EmbedBuilder } = require('discord.js');
const economy = require('../../helpers/economy');

module.exports = {
  name: 'fishing',
  description: '🎣 Pancing ikan dan dapat duit!',
  async execute(message, args) {
    const userId = message.author.id;
    const userName = message.author.username;

    // Cooldown (30 saat)
    const cooldownKey = `fishing_${userId}`;
    const cooldown = global.cooldowns?.[cooldownKey] || 0;
    if (Date.now() < cooldown) {
      const waitTime = Math.ceil((cooldown - Date.now()) / 1000);
      return message.reply(`⏳ Tunggu ${waitTime}s sebelum memancing semula.`);
    }
    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = Date.now() + 30000;

    // Senarai ikan dan ganjaran
    const fishes = [
      { name: '🐟 Ikan Biasa', min: 10, max: 30 },
      { name: '🐠 Ikan Tropika', min: 30, max: 70 },
      { name: '🦈 Jerung Mini', min: 70, max: 150 },
      { name: '🐡 Ikan Buntal', min: 15, max: 45 },
      { name: '🪸 Tangkap Batu Karang', min: 0, max: 5 },
      { name: '💸 Jumpa Dompet Lama!', min: 100, max: 200 }
    ];

    const result = fishes[Math.floor(Math.random() * fishes.length)];
    const reward = Math.floor(Math.random() * (result.max - result.min + 1)) + result.min;

    await economy.addCoins(userId, reward);

    const embed = new EmbedBuilder()
      .setTitle('🎣 Memancing')
      .setDescription(`${message.author} telah ${result.name.toLowerCase()} dan dapat 💰 \`${reward}\` coins!`)
      .setColor('#00f0ff')
      .setFooter({ text: 'Gunakan !balance untuk semak duit anda.' });

    message.reply({ embeds: [embed] });
  }
};