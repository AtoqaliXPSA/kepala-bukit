// utils/gemini.js
const axios = require('axios');
require('dotenv').config();

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function askGemini(prompt) {
  try {
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      }
    );

    console.log('✅ Gemini API: sambungan berjaya');

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      '⚠️ Tiada jawapan.'
    );
  } catch (err) {
    console.error('❌ Gemini API: gagal berhubung');
    // Jika perlu, err.response?.status atau err.code boleh dipamerkan di sini
    return '❌ Ralat semasa hubungi Gemini API.';
  }
}

module.exports = { askGemini };