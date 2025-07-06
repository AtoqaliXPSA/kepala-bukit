const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Senarai command mesej bot ini.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Senarai Command Mesej')
      .setColor('Blue')
      .setDescription('Berikut adalah command mesej yang boleh digunakan:');

    // Akses command mesej melalui interaction.client.messageCommands
    interaction.client.messageCommands.forEach(cmd => {
      embed.addFields({
        name: `dj${cmd.name}`,
        value: cmd.description || 'Tiada deskripsi.',
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], flag: 'ephemeral' }); // hanya pengguna yang tekan boleh lihat
  }
};