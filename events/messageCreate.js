const { execute: handleMessageXP } = require('./messageXP');
const { getPrefix } = require('../helper/prefixHelper');
const { checkCooldown } = require('../helper/cooldownHelper');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // XP Handler
    try {
      await handleMessageXP(message);
    } catch (err) {
      console.error('[MESSAGE_XP_ERROR]', err);
    }

    // Prefix Handler
    const prefix = getPrefix();
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command =
      client.messageCommands?.get(cmdName) ||
      [...(client.messageCommands?.values() || [])].find(
        cmd => cmd.alias?.map(a => a.toLowerCase()).includes(cmdName)
      );

    if (!command) return;

    // ✅ Cooldown check
    if (command.cooldown) {
      const cooldown = await checkCooldown(message, command.name, command.cooldown);
      if (cooldown) return;
    }

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[COMMAND ERROR]`, err);
      message.reply('❌ Error executing command.');
    }
  },
};