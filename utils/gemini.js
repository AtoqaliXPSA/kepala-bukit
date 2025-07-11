const axios = require('axios');
require('dotenv').config();

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function askGemini(prompt) {
  try {
    console.log('[Gemini] Prompt diterima:', prompt); // 🔍 Debug log

    const { data } = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      }
    );

    console.log('[Gemini] Respon penuh:', JSON.stringify(data, null, 2)); // 🔍 Lihat respon Gemini

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      '⚠️ Tiada jawapan.';

    console.log('[Gemini] Jawapan:', reply);

    return reply;
  } catch (err) {
    console.error('[Gemini] Ralat API:', err.response?.data || err.message);
    return '❌ Ralat semasa hubungi Gemini API.';
  }
}

module.exports = { askGemini };