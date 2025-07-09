const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List of all commands.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setDescription('\`Berikut adalah senarai command mesej.\`\n\`Gunakan dj {command} untuk mengunakan bot.\`');

    const basePath = path.resolve(__dirname, '../message');
    const categories = fs.readdirSync(basePath).filter(folder =>
      fs.statSync(path.join(basePath, folder)).isDirectory()
    );

    for (const category of categories) {
      const commands = fs
        .readdirSync(path.join(basePath, category))
        .filter(file => file.endsWith('.js'));

      const fields = [];

      for (const file of commands) {
        const command = require(path.join(basePath, category, file));
        if (command.name) {
          fields.push(`\`${command.name}\``);
        }
      }

      if (fields.length) {
        embed.addFields({
          name: `***${category.toUpperCase()}***`,
          value: fields.join('  '),
          inline: false,
        });
      }
    }

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};