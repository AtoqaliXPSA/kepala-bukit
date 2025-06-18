const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'devcoins',
  description: 'Tambah atau tolak coins pengguna (admin sahaja)',

  async execute(message, args, client) {
    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran.');
    }

    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Sila tag user.');

    const userData = await User.findOneAndUpdate(
      { userId: target.id },
      { $setOnInsert: { userId: target.id, balance: 0 } },
      { upsert: true, new: true }
    );

    const embed = new EmbedBuilder()
      .setTitle(`DEV PANEL: ${target.username}`)
      .setDescription(`Coins semasa: **${userData.balance}**`)
      .setColor('Gold');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`add_${target.id}`).setLabel('Tambah').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`remove_${target.id}`).setLabel('Tolak').setStyle(ButtonStyle.Danger)
    );

    await message.reply({ embeds: [embed], components: [row] });
  }
};