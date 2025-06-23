const { Collection } = require('discord.js');
const cooldowns = new Collection();

/**
 * Semak dan set cooldown untuk command.
 * @param {object} source - `message` atau `interaction` object
 * @param {string} commandName
 * @param {number} cooldownSeconds
 * @returns {boolean} - `true` jika masih dalam cooldown, `false` jika boleh guna
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

      // Pilih fungsi balas yang sesuai
      const reply = source.reply?.bind(source) || source.channel?.send?.bind(source.channel);
      if (reply) {
        try {
          const msg = await reply(`⏳ Sila tunggu **${timeLeft}s**...`);
          setTimeout(() => msg.delete().catch(() => {}), 3000);
        } catch (err) {
          console.error('❌ Cooldown message gagal dihantar:', err.message);
        }
      }

      return true; // masih dalam cooldown
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return false; // tiada cooldown, boleh guna
}

module.exports = { checkCooldown };