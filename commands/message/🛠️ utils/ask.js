const { askGemini } = require('../../../utils/gemini');

module.exports = {
  name: 'ask',
  description: 'Tanya Google Gemini!',
  cooldown: 5,

  async execute(message, args) {
    const prompt = args.join(' ');
    if (!prompt)
      return message.reply('❌ Sila taip soalan: `!ask <soalan>`');

    const waitMsg = await message.reply('⏳ Menjana jawapan dari Gemini...');
    const answer = await askGemini(prompt);

    const response = `**Soalan:** ${prompt}\n\n**Gemini:** ${answer.slice(0, 1990)}`;
    waitMsg.edit(response);
  }
};