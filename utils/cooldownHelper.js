// utils/cooldownHelper.js
const { Collection, EmbedBuilder } = require('discord.js');

const cooldowns = new Collection();

function checkCooldown(commandName, userId, cooldownSeconds) {
  const now = Date.now();
  const timestamps = cooldowns.get(commandName) || new Collection();
  cooldowns.set(commandName, timestamps);

  const cooldownAmount = cooldownSeconds * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = ((expirationTime - now) / 1000).toFixed(1);

      const embed = new EmbedBuilder()
        .setTitle('⏳ Cooldown Aktif')
        .setDescription(`Sila tunggu **${timeLeft} saat** sebelum guna semula arahan ini.`)
        .setColor('Red')
        .setTimestamp();

      return embed; // Return embed jika masih dalam cooldown
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return null; // Tiada cooldown
}

module.exports = { checkCooldown };