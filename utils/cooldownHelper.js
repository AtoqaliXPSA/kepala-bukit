const { Collection } = require('discord.js');
const cooldowns = new Collection();

/**
 * Cek dan set cooldown untuk sesuatu arahan.
 * @param {object} source - `message` atau `interaction` object
 * @param {string} commandName
 * @param {number} cooldownSeconds
 * @returns {boolean} - true jika dalam cooldown, false jika tidak
 */
async function checkCooldown(source, commandName, cooldownSeconds) {
  const userId = source.author?.id || source.user?.id;
  if (!userId) return false;

  const now = Date.now();
  const timestamps = cooldowns.get(commandName) || new Collection();
  cooldowns.set(commandName, timestamps);

  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);

      const replyFunc = source.reply?.bind(source) || source.channel?.send?.bind(source.channel);
      if (replyFunc) {
        const msg = await replyFunc(`⏳ Sila tunggu **${timeLeft}s** sebelum guna semula arahan ini.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000); // padam mesej selepas 3s
      }

      return true;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return false;
}

module.exports = { checkCooldown };