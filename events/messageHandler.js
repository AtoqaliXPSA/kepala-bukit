const { Events } = require('discord.js');
const { checkCooldown } = require('../helper/cooldownHelper');
const xpHandler = require('./messageXP');

module.exports = function setupMessageHandler(client) {
  client.on(Events.MessageCreate, async (m) => {
    if (m.author.bot || !m.guild) return;

    // XP System
    await xpHandler(m);

    // Prefix Commands
    const prefix = process.env.PREFIX || '!';
    if (!m.content.startsWith(prefix)) return;
    const [cmdName, ...args] = m.content.slice(prefix.length).trim().split(/ +/);
    const cmd = client.messageCommands.get(cmdName) ||
      [...client.messageCommands.values()].find(c => c.alias?.includes(cmdName));

    if (!cmd) return;
    if (await checkCooldown(m, cmdName, cmd.cooldown || 0)) return;

    try {
      await cmd.execute(m, args, client);
    } catch (e) {
      console.error(e);
      m.reply('Error executing command.');
    }
  });
};