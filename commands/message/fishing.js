const { EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  name: 'fishing',
  alias: ['fish'],
  description: '🎣 Pancing ikan dan dapat duit!',
  cooldown: 5,
  
  async execute(message, args) {
    const userId = message.author.id;
    const userName = message.author.username;
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