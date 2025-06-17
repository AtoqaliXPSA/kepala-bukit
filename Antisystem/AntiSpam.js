const { Collection, PermissionsBitField } = require('discord.js');

// Cache spam data: guild-user => { messages: [timestamps], strikes: number }
const spamData = new Collection();

const WHITELIST_ROLE_IDS = ['593854878980374564']; // Masukkan role ID admin/mod di sini
const MAX_MESSAGES = 5;       // max mesej
const TIME_WINDOW = 7000;     // dalam ms
const MAX_STRIKES = 3;
const MUTE_TIME = 5 * 60 * 1000; // 5 minit

async function handleSpam(message) {
  const { author, guild, member } = message;
  if (!guild || author.bot) return false;

  // ✅ Kecualikan admin/mod
  if (member.roles.cache.some(role => WHITELIST_ROLE_IDS.includes(role.id))) return false;
  if (member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return false;

  const key = `${guild.id}-${author.id}`;
  const now = Date.now();

  if (!spamData.has(key)) {
    spamData.set(key, { messages: [], strikes: 0 });
  }

  const userData = spamData.get(key);
  userData.messages.push(now);

  // Buang mesej lama
  userData.messages = userData.messages.filter(timestamp => now - timestamp <= TIME_WINDOW);

  if (userData.messages.length > MAX_MESSAGES) {
    userData.strikes += 1;
    userData.messages = []; // reset spam window

    if (userData.strikes >= MAX_STRIKES) {
      const muteRole = guild.roles.cache.find(role => role.name.toLowerCase() === 'muted');
      if (muteRole) {
        await member.roles.add(muteRole, 'Auto-mute oleh sistem anti-spam');
        message.channel.send(`🔇 ${author} telah dimute selama 5 minit kerana spam.`);

        setTimeout(async () => {
          await member.roles.remove(muteRole, 'Unmute selepas timeout anti-spam');
          spamData.delete(key);
        }, MUTE_TIME);
      } else {
        message.channel.send(`⚠️ ${author} spam terlalu banyak (strike ${userData.strikes}) tetapi tiada role 'Muted' tersedia.`);
      }
      return true;
    } else {
      message.channel.send(`⚠️ ${author}, berhenti spam! (Strike ${userData.strikes}/${MAX_STRIKES})`);
    }

    return true;
  }

  return false;
}

module.exports = { handleSpam };