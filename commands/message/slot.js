const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User'); // Pastikan laluan betul

module.exports = {
  name: 'slot',
  alias: ['s', 'spin'],
  cooldown: 15, // saat
  async execute(message, args) {
    const userId = message.author.id;
    const amount = parseInt(args[0]) || 1;

    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    if (user.balance < amount) {
      return message.reply(`❌ Anda perlukan sekurang-kurangnya ${amount} coins untuk main slot.`);
    }

    const emojis = ['🍒', '🍋', '🔔', '⭐', '🍇'];
    const getRandomSlots = () => [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)]
    ];

    const embed = new EmbedBuilder()
      .setTitle('🎰 Mesin Slot')
      .setColor('Orange')
      .setDescription('⏳ Memutar slot...')
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    const sentMessage = await message.reply({ embeds: [embed] });

    // Simulasi animasi gulungan
    for (let i = 0; i < 3; i++) {
      const [a, b, c] = getRandomSlots();
      embed.setDescription(` | ${a} | ${b} | ${c} |\n\n⏳ Memutar...`);
      await sentMessage.edit({ embeds: [embed] });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const [slot1, slot2, slot3] = getRandomSlots();
    let result = '';
    let winnings = 0;

    if (slot1 === slot2 && slot2 === slot3) {
      winnings = amount * 5;
      user.balance += winnings;
      result = `🎉 Jackpot! Anda menang **${winnings.toLocaleString()}** coins!`;
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      winnings = amount * 2;
      user.balance += winnings;
      result = `✨ Menang kecil! Anda dapat **${winnings.toLocaleString()}** coins.`;
    } else {
      user.balance -= amount;
      result = `😢 Anda kalah **${amount.toLocaleString()}** coins.`;
    }

    await user.save();

    embed
      .setColor('#00f6ff')
      .setDescription(` | ${slot1} | ${slot2} | ${slot3} |\n\n${result}`)
      .addFields({ name: '💰 Baki Semasa =>', value: `${user.balance.toLocaleString()} coins`, inline: true });

    await sentMessage.edit({ embeds: [embed] });
  }
};