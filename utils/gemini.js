/**
 * Fail pembungkus Gemini API (v1beta1)
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_ID   = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash-latest';
const genAI      = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model      = genAI.getGenerativeModel({ model: MODEL_ID });

/**
 * Ping ringkas ketika start-up
 */
async function ping() {
  try {
    await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      generationConfig: { maxOutputTokens: 1 }
    });
    console.log(`✅ Gemini API Connected (${MODEL_ID})`);
  } catch (e) {
    console.error('❌ Error Connet Gemini:', e.message);
  }
}

/**
 * Dapatkan respons AI berdasarkan prompt & konteks
 */
async function askGemini(contents) {
  const res = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 800
    }
  });
  return res?.response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

module.exports = { askGemini, ping };