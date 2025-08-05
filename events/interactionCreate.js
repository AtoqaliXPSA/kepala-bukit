const { checkCooldown } = require('../helper/cooldownHelper');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: '⚠️ Command not found.', ephemeral: true });
    }

    // ✅ Cooldown check
    if (command.cooldown) {
      const cooldown = await checkCooldown(interaction, command.name, command.cooldown);
      if (cooldown) return; // kalau masih dalam cooldown, keluar awal
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error('[SLASH CMD ERROR]', err);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Error executing this command!', ephemeral: true });
      }
    }
  }
};