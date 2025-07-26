const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const replyHelper = require('../../helper/replyHelper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Uji kelajuan respons bot.'),

  async execute(interaction) {
    const start = Date.now();

    await interaction.deferReply(); // elak timeout
    const ping = Date.now() - start;
    const apiPing = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`**Bot Ping:** \`${ping}ms\`\n**API Ping:** \`${apiPing}ms\``)
      .setColor(0x00AEFF)
      .setTimestamp();

    await replyHelper.edit(interaction, { embeds: [embed] });
  }
};