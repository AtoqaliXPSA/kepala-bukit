const { Collection } = require('discord.js');

const cooldowns = new Collection();

async function checkCooldown(source, commandName, cooldownSeconds) {
  const userId = source.author?.id || source.user?.id;
  const replyFunc = source.reply.bind(source);

  if (!userId) return false;

  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownTime = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expires = timestamps.get(userId) + cooldownTime;

    if (now < expires) {
      const remaining = ((expires - now) / 1000).toFixed(1);
      const reply = await replyFunc(`⏳| Sila tunggu ${remaining}s sebelum guna semula.`);
      setTimeout(() => {
        if (reply.delete) reply.delete().catch(() => {});
      }, expires - now);
      return true;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownTime);
  return false;
}

module.exports = { checkCooldown };