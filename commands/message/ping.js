const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',

  async execute(message, args, client) {
    const start = Date.now();

    // Hantar mesej awal
    const sentMessage = await message.reply('🏓 Mengira ping...');

    const ping = Date.now() - start;
    const apiPing = client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setDescription(`**Bot Ping:** ${ping}ms`)
      .setColor(0x00AEFF)
      .setTimestamp();

    await sentMessage.edit({ content: '', embeds: [embed] });
  }
};