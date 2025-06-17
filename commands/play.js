const { SlashCommandBuilder } = require('discord.js');
const { playSong } = require('../utils/musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Mainkan lagu dari YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Link atau nama lagu')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Anda perlu berada dalam voice channel.', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false
      });

      await interaction.reply({ content: `✅ Telah masuk ke **${channel.name}**.` });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Gagal masuk ke voice channel.', ephemeral: true });
    }
  }
};
