module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 5,

  if (embed.data && !embed.data.description && (!embed.data.fields || embed.data.fields.length === 0)) {
    console.error('❌ Embed kosong tidak boleh dihantar!');
    return;
  }

  async execute(message, args, client) {
    const start = Date.now();

    // Hantar mesej awal
    const sentMessage = await message.reply('🏓 Mengira ping...');

    // Kira ping selepas mesej dihantar
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping || 0);

    // Edit mesej dengan maklumat ping
    await sentMessage.edit(
      `🏓 Pong!\n📶 Bot Latency: ${latency}ms\n💻 API Latency: ${apiPing}ms`
    );
  }
};