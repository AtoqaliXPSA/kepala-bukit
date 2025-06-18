const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const adminId = process.env.ADMIN_ID;

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    // ✅ Modal untuk tambah/tolak
    if (interaction.isButton()) {
      if (interaction.user.id !== adminId) {
        return interaction.reply({ content: '❌ Akses terhad untuk admin sahaja.', ephemeral: true });
      }

      const [action, userId] = interaction.customId.split('_');
      const modal = new ModalBuilder()
        .setCustomId(`modal_${action}_${userId}`)
        .setTitle(action === 'add' ? 'Tambah Coins' : 'Tolak Coins');

      const input = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel('Masukkan jumlah coins:')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Contoh: 100')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      await interaction.showModal(modal);
    }

    // ✅ Proses input modal
    if (interaction.isModalSubmit()) {
      const [_, action, userId] = interaction.customId.split('_');
      const amount = parseInt(interaction.fields.getTextInputValue('amount'));

      if (interaction.user.id !== adminId) {
        return interaction.reply({ content: '❌ Akses ditolak.', ephemeral: true });
      }

      if (isNaN(amount) || amount < 0) {
        return interaction.reply({ content: '❌ Jumlah tidak sah. Gunakan nombor positif.', ephemeral: true });
      }

      const targetData = await User.findOne({ userId });
      if (!targetData) {
        return interaction.reply({ content: '❌ Data pengguna tiada.', ephemeral: true });
      }

      if (action === 'add') {
        targetData.balance += amount;
      } else if (action === 'remove') {
        targetData.balance -= amount;
        if (targetData.balance < 0) targetData.balance = 0;
      }

      await targetData.save();

      const embed = new EmbedBuilder()
        .setTitle('✅ Coins Dikemaskini')
        .setDescription(`**${action === 'add' ? 'Tambah' : 'Tolak'} ${amount} coins** kepada <@${userId}>.\n💰 Baki sekarang: **${targetData.balance}**`)
        .setColor(action === 'add' ? 'Green' : 'Red')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};