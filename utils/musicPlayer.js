const { joinVoiceChannel, createAudioPlayer, createAudioResource, getVoiceConnection, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const player = createAudioPlayer();

player.on(AudioPlayerStatus.Idle, () => {
  // Lagu tamat main — boleh tambah sistem queue di sini
});

async function playSong(voiceChannel, query, interaction) {
  let streamInfo;

  if (play.yt_validate(query) === 'video') {
    streamInfo = await play.stream(query);
  } else {
    const search = await play.search(query, { limit: 1 });
    if (!search[0]) throw new Error('Lagu tidak dijumpai');
    streamInfo = await play.stream(search[0].url);
  }

  const resource = createAudioResource(streamInfo.stream, {
    inputType: streamInfo.type
  });

  joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator
  }).subscribe(player);

  player.play(resource);

  interaction.editReply(`🎵 Sedang memainkan: **${query}**`);
}

module.exports = { playSong };
