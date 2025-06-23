// utils/cooldownHelper.js
const { Collection, EmbedBuilder } = require('discord.js');

const cooldowns = new Collection();

/**
 * Semak dan laksanakan cooldown untuk command.
 * @param {string} commandName - Nama command.
 * @param {string} userId - ID pengguna.
 * @param {number} cooldownSeconds - Tempoh cooldown dalam saat.
 * @returns {EmbedBuilder|null} - Embed jika dalam cooldown, null jika boleh teruskan.
 */
function checkCooldown(commandName, userId, cooldownSeconds) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  const cooldownTime = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownTime;

    if (now < expirationTime) {
      const remaining = ((expirationTime - now) / 1000).toFixed(1);

      return new EmbedBuilder()
        .setTitle('⏳ Tunggu sebentar!')
        .setDescription(`Anda perlu tunggu **${remaining}s** sebelum boleh guna command ini semula.`)
        .setColor('Red')
        .setTimestamp();
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownTime);

  return null;
}

module.exports = { checkCooldown };