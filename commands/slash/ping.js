const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const replyHelper = require('../../helper/replyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Uji kepantasan respon bot!'),

  async execute(interaction) {
    const start = Date.now();

    await interaction.reply({ content: '🏓 Mengira ping...' });

    const ping = Date.now() - start;
    const apiPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`**Bot Ping:** ${ping}ms`)
      .setColor(0x00AEFF);

    await replyHelper.edit(interaction, { content: '', embeds: [embed] });
  }
};
