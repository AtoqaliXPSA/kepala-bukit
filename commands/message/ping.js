const { checkCooldown } = require('../../utils/cooldownHelper');

module.exports = {
  name: 'ping',
  async execute(message) {
    const isCooldown = await checkCooldown(message, 'ping', 2);
    if (isCooldown) return;

    const start = Date.now();
    const sent = await message.reply('🏓 Mengira ping...');
    const latency = Date.now() - start;

    await sent.edit(`🏓 Pong! **${latency}ms**`);
  }
};