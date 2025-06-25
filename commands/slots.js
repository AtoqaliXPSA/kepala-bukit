const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('🎰 Main slot dengan efek gulungan dalam embed!')
    .addIntegerOption(option =>
      option.setName('taruhan')
        .setDescription('Jumlah coin untuk dipertaruhkan')
        .setMinValue(1)
    ),

  cooldown: 5, // Cooldown

  async execute(interaction) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('taruhan') || 1;

    let user = await User.findOne({ userId });
    if (!user) user = await User.create({ userId });

    if (user.balance < amount) {
      return interaction.reply({
        content: `❌ Anda perlukan sekurang-kurangnya ${amount} coins untuk main slot.`,
        flags: 64
      });
    }

    const emojis = ['🍒', '🍋', '🔔', '⭐', '🍇'];
    const getRandomSlots = () => [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)]
    ];

    // Defer untuk beri masa
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle('🎰 Mesin Slot')
      .setColor('Orange')
      .setDescription('⏳ Memutar slot...')
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    const message = await interaction.editReply({ embeds: [embed] });

    // Simulasi animasi gulungan
    for (let i = 0; i < 3; i++) {
      const [a, b, c] = getRandomSlots();
      embed.setDescription(` | ${a} | ${b} | ${c} |\n\n⏳ Memutar...`);
      await interaction.editReply({ embeds: [embed] });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Putaran akhir
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

    // Tunjuk hasil akhir
    embed
      .setColor('Blue')
      .setDescription(` | ${slot1} | ${slot2} | ${slot3} |\n\n${result}`)
      .addFields({ name: '💰 Baki Semasa =>', value: `${user.balance.toLocaleString()} coins`, inline: true });

    await interaction.editReply({ embeds: [embed] });
  }
};