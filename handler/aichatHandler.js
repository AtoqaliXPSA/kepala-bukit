const dotenv  = require('dotenv');
dotenv.config();

const { askGemini }  = require('../utils/gemini');
const AiChat         = require('../models/aiModel');

const HISTORY_SIZE   = Number(process.env.MESSAGE_HISTORY) || 10;
const activeCache    = new Map();                       // guildId-channelId  -> bool
const history        = new Map();                       // channelId         -> [{ role, text }]

/* ---------- util ringkas ---------- */
const key = (g, c) => `${g}-${c}`;

function pushHistory(channelId, role, text) {
  const h = history.get(channelId) || [];
  h.push({ role, text });
  if (h.length > HISTORY_SIZE) h.shift();
  history.set(channelId, h);
}

async function isAIChannel(guildId, channelId) {
  const k = key(guildId, channelId);
  if (activeCache.has(k)) return activeCache.get(k);

  const cfg = await AiChat.findActiveChannel(guildId, channelId).catch(() => null);
  const active = !!cfg;
  activeCache.set(k, active);
  setTimeout(() => activeCache.delete(k), 5 * 60 * 1000);   // 5-min cache
  return active;
}

/* ---------- event binder (dipanggil di index.js) ---------- */
function bindAIChat(client) {
  client.on('messageCreate', async msg => {
    if (msg.author.bot || !msg.guild) return;
    if (!(await isAIChannel(msg.guild.id, msg.channel.id))) return;

    pushHistory(msg.channel.id, 'user', msg.content);
    await msg.channel.sendTyping();

    try {
      const systemPrompt = {
        role  : 'user',
        parts : [{ text: 'You are a helpful Discord bot assistant. Responses must be concise, friendly, no markdown.' }]
      };

      const ctx = history.get(msg.channel.id).map(m => ({
        role  : m.role === 'bot' ? 'model' : 'user',
        parts : [{ text: m.text }]
      }));

      const reply = await askGemini([systemPrompt, ...ctx]);

      if (!reply) return msg.reply('Maaf, saya tidak dapat membalas sekarang.');
      pushHistory(msg.channel.id, 'bot', reply);

      // pecah > 2k
      for (let i = 0; i < reply.length; i += 2000)
        await msg.reply(reply.slice(i, i + 2000));

    } catch (e) {
      console.error(`[AI Chat]`, e);
      msg.reply('⚠️ Ralat AI.');
    }
  });
}

module.exports = { bindAIChat };