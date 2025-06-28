const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const User = require('../../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'devuser',
  description: 'Panel dev untuk tambah/tolak coins & stamina (admin sahaja)',

  async execute(message, args) {
    // ✅ Semak admin
    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran.');
    }

    // ✅ Dapatkan user yang ditag
    const target = message.mentions.users.first();
    if (!target) return message.reply('❌ Sila tag user.');

    // ✅ Cari atau cipta user dalam database
    const userData = await User.findOneAndUpdate(
      { userId: target.id },
      { $setOnInsert: { userId: target.id, balance: 0, stamina: 5 } },
      { upsert: true, new: true }
    );

    // ✅ Buat embed untuk paparan info
    const embed = new EmbedBuilder()
      .setTitle(`🛠️ DEV PANEL: ${target.username}`)
      .setColor('Aqua')
      .setDescription(`💰 Coins: **${userData.balance}**\n⚡ Stamina: **${userData.stamina ?? 0}**`);

    // ✅ Susun butang tambah/tolak coins & stamina
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`add_coins_${target.id}`)
        .setLabel('➕ Coins')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`remove_coins_${target.id}`)
        .setLabel('➖ Coins')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`add_stamina_${target.id}`)
        .setLabel('🔋 Tambah Stamina')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`remove_stamina_${target.id}`)
        .setLabel('🪫 Tolak Stamina')
        .setStyle(ButtonStyle.Secondary)
    );

    // ✅ Hantar mesej dengan embed dan butang
    await message.reply({ embeds: [embed], components: [row] });
  }
};