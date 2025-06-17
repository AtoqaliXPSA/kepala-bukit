const { SlashCommandBuilder } = require('discord.js');
const Afk = require('../models/Afk');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Tetapkan status AFK anda')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Sebab anda AFK')
        .setRequired(false)
    ),

  async execute(interaction) {
    const reason = interaction.options.getString('reason') || 'Tidak dinyatakan';
    const userId = interaction.user.id;

    await Afk.findOneAndUpdate(
      { userId },
      { reason, timestamp: new Date() },
      { upsert: true }
    );

    await interaction.reply({ content: `✅ Anda kini ditandakan sebagai AFK: ${reason}`, flags: 1 << 6 });
  }
};