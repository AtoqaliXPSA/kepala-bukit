const { checkCooldown } = require('../../utils/cooldownHelper');

module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 3,

  async execute(message, args, client) {
    const onCooldown = await checkCooldown(message, 'ping', 3);
    if (onCooldown) return;

    const start = Date.now(); // ✅ tambah ini sebelum hantar mesej

    // Hantar mesej awal
    const sentMessage = await message.reply('🏓 Mengira ping...');

    // Kira ping selepas mesej dihantar
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping || 0);

    // Edit mesej dengan maklumat ping
    await sentMessage.edit(`🏓 Pong: **${latency}ms**`);
  }
};