const { checkCooldown } = require('../../utils/cooldownHelper');

module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 3, // hanya boleh guna sekali setiap 3 saat

  async execute(message, args, client) {
    const onCooldown = await checkCooldown(message, this.name, this.cooldown);
    if (onCooldown) return;

    const start = Date.now();
    const sent = await message.reply('🏓 Mengira ping...');

    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping);

    await sent.edit(`🏓 Pong!\n📶 Bot Latency: **${latency}ms**\n🌐 API Ping: **${apiPing}ms**`);
  }
};