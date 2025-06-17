const { exec } = require('child_process');

module.exports = {
  name: 'dep', // command name: !dep
  
  async execute(message, args, client) {
    const adminId = process.env.ADMIN_ID;

    if (message.author.id !== adminId) {
      return message.reply('❌ Anda tiada kebenaran untuk guna command ini.');
    }

    message.reply('🔄 Mula deploy...');

    try {
      // Jalankan script deploy secara shell
      exec('node reset.js', (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);
          return message.reply('❌ Ralat semasa deploy.');
        }

        console.log(stdout);
        message.reply('✅ Command berjaya dideploy! \n🔄 Bot akan restart dalam 5 saat...');
      });
    } catch (error) {
      console.error(error);
      message.reply('❌ Gagal untuk deploy command.');
    }
  }
};