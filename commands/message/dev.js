const { EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  name: 'dev',
  async execute(message, args, client) {
    const adminId = process.env.ADMIN_ID;

    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran untuk guna command ini.');
    }

    const uptime = Math.floor(process.uptime());
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2);
    const latency = Date.now() - message.createdTimestamp;
    const nodeVersion = process.version;
    const djsVersion = require('discord.js').version;

    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Status')
      .setColor('Blue')
      .addFields(
        { name: '🟢 Uptime', value: `<t:${Math.floor((Date.now() - uptime * 1000) / 1000)}:R>`, inline: true },
        { name: '🌍 Guilds', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
        { name: '📶 Ping', value: `${latency}ms`, inline: true },
        { name: '🧠 RAM', value: `${usedMem}MB / ${totalMem}MB`, inline: true },
        { name: '⚙️ CPU Load', value: `${cpuLoad}`, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `Diminta oleh ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    try {
      await message.author.send({ embeds: [embed] });
      await message.react('🔄'); // optional: indicate success
    } catch (err) {
      console.error(err);
      return message.reply('❌ Saya tak dapat hantar DM kepada anda. Sila buka DM.');
    }
  }
};