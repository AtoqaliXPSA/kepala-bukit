const { Collection } = require('discord.js');

const cooldowns = new Collection();
const cooldownNotified = new Collection();

/**
 * Semak cooldown dan reply jika masih aktif.
 * @param {object} source - message atau interaction
 * @param {string} commandName - nama command
 * @param {number} cooldownSeconds - masa cooldown dalam saat
 * @returns {Promise<boolean>} true jika dalam cooldown, false jika tidak
 */
async function checkCooldown(source, commandName, cooldownSeconds) {
  const userId = source.author?.id || source.user?.id;
  if (!userId) return false;

  const now = Date.now();
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
      const notifyKey = `${commandName}_${userId}`;

      if (!cooldownNotified.has(notifyKey)) {
        const reply = source.reply?.bind(source) || source.channel?.send?.bind(source.channel);
        if (reply) {
          const msg = await reply(`⏳ | Please wait **${timeLeft}s** to use again.`);
          cooldownNotified.set(notifyKey, msg);

          const delay = Math.max(0, expirationTime - now); // ✅ Pastikan tidak negatif
          setTimeout(async () => {
            try {
              await msg.delete();
            } catch {}
            cooldownNotified.delete(notifyKey);
          }, delay);
        }
      }

      return true;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return false;
}

module.exports = { checkCooldown };