const economy = require('../../../utils/economy');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  description: 'Teka kepala atau ekor dan menang coins!',
  alias: ['cf'],

  async execute(message, args) {
    const userId = message.author.id;
    const bet = parseInt(args[0]) || 1;

    if (bet < 1) return message.reply('❌ Minimum pertaruhan ialah 1 coin.');

    // Semak balance
    const userData = await economy.getUser(userId);
    if (userData.balance < bet) {
      return message.reply('❌ Anda tiada cukup coins untuk pertaruhan ini.');
    }

    // Simulasi flipping dengan teks animasi
    const sides = ['HEADS', 'TAILS'];
    const chosen = sides[Math.floor(Math.random() * sides.length)];

    const embed = new EmbedBuilder()
      .setTitle('🪙 Coinflip Bermula!')
      .setDescription('Flipping coin...')
      .setColor(0x00AEFF);

    const sent = await message.reply({ embeds: [embed] });

    // Animasi teks - flipping
    const animations = ['🪙', '🔄', '🔁', '🔃', '⏳'];
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      await sent.edit({ embeds: [embed.setDescription(`${animations[i % animations.length]} Coin flipping...`)] });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Tentukan menang atau kalah
    const win = Math.random() < 0.5;
    const result = win ? '🏆 MENANG!' : '💀 KALAH!';
    const color = win ? 0x00FF88 : 0xFF5555;

    if (win) {
      await economy.addBalance(userId, bet);
    } else {
      await economy.addBalance(userId, -bet);
    }

    const finalEmbed = new EmbedBuilder()
      .setTitle('🪙 Coinflip Result')
      .setDescription(`**Hasil:** ${chosen}\n**Keputusan:** ${result}\n**Pertaruhan:** 💰 ${bet} coins`)
      .setColor(color)
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await sent.edit({ embeds: [finalEmbed] });
  }
};