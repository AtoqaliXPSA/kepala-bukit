module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: '⚠️ Command not found.', ephemeral: true });
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error('[SLASH CMD ERROR]', err);
      await interaction.reply({ content: '❌ Error executing this command!', ephemeral: true });
    }
  }
};