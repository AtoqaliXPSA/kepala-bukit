// commands/message/ai/ask.js
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

module.exports = {
  name: "ask",
  alias: ["gpt", "ai"],
  description: "Tanya soalan kepada Gemini AI",
  cooldown: 8, // saat

  async execute(message, args) {
    const prompt = args.join(" ").trim();
    if (!prompt)
      return message.reply("❌ Sila masukkan soalan. Contoh: `!ask Apa itu quark?`");

    // 👉 Papar typing supaya user nampak bot “berfikir”
    message.channel.sendTyping();

    try {
      const { data } = await axios.post(
        `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        },
      );

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Maaf, saya tidak dapat menjawab sekarang.";

      // Bahagi jika >2000 aksara
      for (let i = 0; i < reply.length; i += 2000) {
        await message.reply(reply.slice(i, i + 2000));
      }
    } catch (err) {
      console.error("❌ Gemini error:", err.response?.data || err.message);
      message.reply("⚠️ Terdapat ralat ketika berhubung dengan AI.");
    }
  },
};