const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Senarai command mesej bot ini.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Senarai Command Mesej')
      .setColor(0x00AEFF)
      .setDescription('Berikut adalah command mesej yang boleh digunakan:')
      .setFooter({ text: `Diminta oleh ${interaction.user.tag}` })
      .setTimestamp();

    const commandDir = path.join(__dirname, '../commands/message');

    function readCommands(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          readCommands(fullPath);
        } else if (file.endsWith('.js')) {
          try {
            const cmd = require(fullPath);
            if (cmd.name) {
              embed.addFields({
                name: `dj${cmd.name}`,
                value: cmd.description || 'Tiada deskripsi.',
                inline: false
              });
            }
          } catch (err) {
            console.error(`❌ Gagal baca command dari ${fullPath}`, err);
          }
        }
      }
    }

    readCommands(commandDir);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};