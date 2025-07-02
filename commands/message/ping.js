const { checkCooldown } = require('../../utils/cooldownHelper');

module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',

  async execute(message, _, client) {
    const onCooldown = await checkCooldown(message, 'ping', 3);
    if (onCooldown) return;

    const start = Date.now();

    const sentMessage = await message.reply('🏓 Mengira ping...');
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping);

    await sentMessage.edit(`🏓 Pong! Latency: **${latency}ms**, API: **${apiPing}ms**`);
  }
};