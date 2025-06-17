const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Bekerja dan dapatkan duit!'),

  async execute(interaction) {
    const userId = interaction.user.id;

    let userData = await User.findOne({ userId });
    if (!userData) {
      userData = await User.create({ userId });
    }

    const now = Date.now();
    const cooldown = 30 * 60 * 1000; // 5 minit
    const lastWork = userData.lastWork ? userData.lastWork.getTime() : 0;

    if (now - lastWork < cooldown) {
      const remaining = cooldown - (now - lastWork);
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      const cooldownEmbed = new EmbedBuilder()
        .setTitle('⏳ Cooldown Aktif')
        .setDescription(`Anda perlu tunggu **${minutes} minit ${seconds} saat** sebelum bekerja semula.`)
        .setColor('Red')
        .setFooter({ text: 'Sabar itu separuh dari kejayaan!' });

      return interaction.reply({
        embeds: [cooldownEmbed],
        flags: 64
      });
    }


    const jobs = [
      'YouTuber', 'Chef', 'Waiter', 'Streamer', 'Seller air ketum',
      'Programmer', 'Delivery Rider', 'Driver Grab', 'Cheff', 'Zoo keeper'
    ];

    const chosenJob = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * 200) + 50;

    userData.balance += earnings;
    userData.lastWork = new Date();
    await userData.save();

    const embed = new EmbedBuilder()
      .setTitle('💼 Kerja Berjaya!')
      .setDescription(`Anda bekerja sebagai **${chosenJob}** dan menerima **RM${earnings}**!`)
      .setColor(0x00AEFF)
      .setFooter({ text: `Jangan lupa rehat!` });

    await interaction.reply({ embeds: [embed] });
  }
};
