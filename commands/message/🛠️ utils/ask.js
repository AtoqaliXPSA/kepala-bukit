// commands/message/ask.js
const axios = require('axios');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

module.exports = {
  name: 'ask',
  alias: ['gpt', 'ai'],
  description: 'Tanya soalan kepada Gemini AI',
  cooldown: 5,

  async execute(message, args) {
    const question = args.join(' ').trim();
    if (!question) return message.reply('Sila tulis soalan selepas `djask`.');

    const contents = [
      {
        role: 'user',
        parts: [{
          text: `Jawab soalan ini dalam Bahasa Melayu secara ringkas, mesra dan padat: ${question}`
        }]
      }
    ];

    try {
      const { data } = await axios.post(
        `${GEMINI_URL}?key=${GEMINI_KEY}`,
        {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512
          }
        }
      );

      const responseText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        'Maaf, tiada jawapan dijumpai.';

      // Hantar jawapan secara terpotong jika > 2000 aksara
      for (let i = 0; i < responseText.length; i += 1990) {
        await message.reply(responseText.slice(i, i + 1990));
      }
    } catch (err) {
      console.error('Gemini error:', err.response?.data || err.message);
      return message.reply('Gagal hubungi Gemini API. Sila semak kunci API anda dalam `.env`.');
    }
  }
};