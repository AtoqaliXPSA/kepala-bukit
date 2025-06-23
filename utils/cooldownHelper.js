const { Collection } = require('discord.js');

const cooldowns = new Collection();
const cooldownNotified = new Collection(); // Simpan user yang dah diberi amaran cooldown

/**
 * Cek cooldown dan hantar amaran SEKALI sahaja semasa cooldown.
 * @param {object} source - message atau interaction
 * @param {string} commandName
 * @param {number} cooldownSeconds
 * @returns {boolean} true jika dalam cooldown, false jika tidak
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
    const timeLeft = ((expirationTime - now) / 1000).toFixed(1);

    const notifyKey = `${commandName}_${userId}`;

    // ✅ Hanya reply sekali semasa cooldown aktif
    if (!cooldownNotified.has(notifyKey)) {
      const reply = source.reply?.bind(source) || source.channel?.send?.bind(source.channel);
      if (reply) await reply(`⏳ Tunggu **${timeLeft}s** sebelum guna semula arahan ini.`);

      cooldownNotified.set(notifyKey, true);

      // Lepas cooldown tamat, reset notify supaya boleh reply semula nanti
      setTimeout(() => cooldownNotified.delete(notifyKey), expirationTime - now);
    }

    return true;
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return false;
}

module.exports = { checkCooldown };