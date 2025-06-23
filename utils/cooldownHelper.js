const { Collection } = require('discord.js');

const cooldowns = new Collection();

async function checkCooldown(message, commandName, cooldownSeconds) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownTime = cooldownSeconds * 1000;
  const userId = message.author.id;

  if (timestamps.has(userId)) {
    const expires = timestamps.get(userId) + cooldownTime;

    if (now < expires) {
      const remaining = ((expires - now) / 1000).toFixed(1);
      const reply = await message.reply(`⏳| **${message.author.username}** Sila tunggu ${remaining}s sebelum guna semula.`);
      setTimeout(() => reply.delete().catch(() => {}), expires - now); // auto delete selepas timeout
      return true; // user masih dalam cooldown
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownTime);
  return false; // tiada cooldown
}

module.exports = { checkCooldown };