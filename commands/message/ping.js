const { checkCooldown } = require('../../utils/cooldownHelper');

module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 3,

  async execute(message, args, client) {
    const onCooldown = await checkCooldown(message, this.name, this.cooldown);
    if (onCooldown) return; // stop kalau cooldown aktif

    const start = Date.now();
    const sent = await message.reply('🏓 Mengira ping...');
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping);

    await sent.edit(`🏓 Pong!\n📶 Latency: **${latency}ms**\n🌐 API Ping: **${apiPing}ms**`);
  }
};