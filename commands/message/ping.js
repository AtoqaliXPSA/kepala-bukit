module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 5,

  async execute(message, args, client) {
    const start = Date.now();

    const sentMessage = await message.reply('🏓 Mengira ping...');
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping || 0);

    await sentMessage.edit(
      `🏓 Pong!\n: ${apiPing}ms`
    );
  }
};