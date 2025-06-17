const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Bot akan ulang mesej anda')
    .addStringOption(option =>
      option.setName('mesej')
        .setDescription('Apa yang anda mahu bot katakan')
        .setRequired(true)),
  async execute(interaction) {
    const msg = interaction.options.getString('mesej');
    await interaction.reply(msg);
  },
};