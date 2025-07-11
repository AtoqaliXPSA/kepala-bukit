// commands/message/ask.js
const axios = require('axios');

const GEMINI_KEY  = process.env.GEMINI_API_KEY;  // pastikan dalam .env
const GEMINI_URL  =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

module.exports = {
  name: 'ask',
  alias: ['gpt', 'ai'],
  description: 'Tanya soalan kepada Gemini AI',
  cooldown: 5,                        // 5-saat cooldown

  async execute(message, args) {
    const question = args.join(' ').trim();
    if (!question) return message.reply('❌ Tulis soalan selepas `!ask`.');

    // ――― Panggil Gemini ―――
    try {
      const { data } = await axios.post(
        `${GEMINI_URL}?key=${GEMINI_KEY}`,
        {
          contents: [
            {
              role: 'model',
              parts: [{ text: 'You are a helpful Discord bot. Keep answers concise.' }]
            },
            {
              role: 'user',
              parts: [{ text: question }]
            }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        }
      );

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        'Maaf, tiada jawapan ditemui.';

      // potong supaya < 2000 aksara
      for (let i = 0; i < text.length; i += 1990) {
        await message.reply(text.slice(i, i + 1990));
      }
    } catch (err) {
      console.error('Gemini error:', err.response?.data || err.message);
      message.reply('❌ Gagal hubungi Gemini API. Sila semak kunci API anda.');
    }
  }
};