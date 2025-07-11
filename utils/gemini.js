const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

async function testGeminiConnection() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent("Test sambungan");
    const response = await result.response.text();

    console.log('✅ Gemini API disambungkan!');
    return response;
  } catch (err) {
    console.error('❌ Gagal sambung ke Gemini API:', err.message);
  }
}

module.exports = { testGeminiConnection };