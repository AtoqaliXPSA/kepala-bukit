const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Paparkan avatar pengguna')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Pilih pengguna (jika tiada, anda sendiri)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`Avatar`)
      .setImage(avatarUrl)
      .setURL(avatarUrl)
      .setColor(0x00AEFF)
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}`, iconURL:interaction.user.displayAvatarURL({ dynamic: true}) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};