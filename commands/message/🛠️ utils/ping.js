module.exports = {
  name: 'ping',
  description: 'Uji kepantasan respon bot!',
  cooldown: 5,

  async execute(message, args, client) {
    const start = Date.now();

    // Hantar mesej awal TANPA reply user
    const sentMessage = await message.channel.send('🏓 | Counting ping...');

    // Kira ping selepas mesej dihantar
    const latency = Date.now() - start;
    const apiPing = Math.round(client.ws.ping || 0);

    // Edit mesej dengan maklumat ping
    await sentMessage.edit(
      `🏓 | Pong: ***${apiPing}ms***`
    );
  }
};