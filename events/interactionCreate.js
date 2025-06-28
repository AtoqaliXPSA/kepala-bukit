const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');
const User = require('../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // ⛔ Sekat bukan admin
    if (interaction.user.id !== adminId) {
      return interaction.reply({ content: '❌ Admin sahaja.', ephemeral: true });
    }

    // ✅ Butang ditekan ➕ ➖
    if (interaction.isButton()) {
      const [action, field, userId] = interaction.customId.split('_');
      if (!['add', 'remove'].includes(action) || !['coins', 'stamina'].includes(field)) return;

      const modal = new ModalBuilder()
        .setCustomId(`modal_${action}_${field}_${userId}`)
        .setTitle(`${action === 'add' ? 'Tambah' : 'Tolak'} ${field}`);

      const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel(`Jumlah ${field} yang nak ${action === 'add' ? 'ditambah' : 'ditolak'}`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 100')
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // 📥 Submit modal ➕ ➖
    if (interaction.isModalSubmit()) {
      const [_, action, field, userId] = interaction.customId.split('_');
      const amount = parseInt(interaction.fields.getTextInputValue('amount'));

      if (isNaN(amount) || amount <= 0) {
        return interaction.reply({
          content: '❌ Masukkan jumlah yang sah (> 0).',
          ephemeral: true
        });
      }

      const userData = await User.findOne({ userId });
      if (!userData) {
        return interaction.reply({
          content: '❌ Data pengguna tidak dijumpai.',
          ephemeral: true
        });
      }

      // Pastikan field wujud
      if (field === 'stamina' && userData.stamina === undefined) {
        userData.stamina = 100; // Default jika belum wujud
      }

      // Operasi tambah/tolak
      if (action === 'add') {
        userData[field] += amount;
      } else if (action === 'remove') {
        if (userData[field] < amount) {
          return interaction.reply({
            content: `❌ Pengguna hanya ada ${userData[field]} ${field}.`,
            ephemeral: true
          });
        }
        userData[field] -= amount;
      }

      await userData.save();

      const embed = new EmbedBuilder()
        .setTitle(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} Dikemaskini`)
        .setDescription(
          `**${action === 'add' ? 'Tambah' : 'Tolak'} ${amount} ${field}** kepada <@${userId}>.\n` +
          `Baki sekarang: **${userData[field]} ${field}**`
        )
        .setColor(action === 'add' ? 'Green' : 'Red')
        .setFooter({ text: `Admin: ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};