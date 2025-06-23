const canvacord = require("canvacord");
const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "blur",
  description: "Kaburkan avatar anda",
  cooldown: 5,

  async execute(message) {
    try {
      const avatarURL = message.author.displayAvatarURL({ format: "png", size: 512 });

      // Dapatkan data avatar user sebagai buffer
      const response = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(response.data, "utf-8");

      // Gunakan Canvacord untuk blurkan imej
      const image = await canvacord.Canvas.blur(avatarBuffer);

      const attachment = new AttachmentBuilder(image, { name: "blur.png" });
      await message.reply({ files: [attachment] });
    } catch (err) {
      console.error(`❌ Error in blur command:`, err);
      await message.reply("⚠️ Gagal kaburkan avatar.");
    }
  }
};