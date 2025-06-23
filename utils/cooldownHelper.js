const { Collection } = require('discord.js');
const cooldowns = new Collection();

async function checkCooldown(source, commandName, cooldownSeconds) {
  const userId = source.author?.id || source.user?.id;
  const sendReply = (msg) => {
    if (source.reply) return source.reply(msg);
    if (source.channel?.send) return source.channel.send(msg);
  };

  if (!userId) return false;

  const now = Date.now();
  const timestamps = cooldowns.get(commandName) || new Collection();
  cooldowns.set(commandName, timestamps);

  const cooldownTime = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expires = timestamps.get(userId) + cooldownTime;
    if (now < expires) {
      const remaining = ((expires - now) / 1000).toFixed(1);
      message.channel.send('⏳ Tunggu sebentar sebelum guna semula arahan ini.');
      if (sent?.delete) {
        setTimeout(() => sent.delete().catch(() => {}), expires - now);
      }
      return true;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownTime);
  return false;
}

module.exports = { checkCooldown };