// statusServer.js
require('dotenv').config();
const express = require('express');
const axios   = require('axios');

module.exports = function startStatusServer(client) {
  const app  = express();
  const PORT = process.env.STATUS_PORT || 4000;

  // ===== /status =====
  app.get('/status', async (req, res) => {
    // 1. test Gemini
    let geminiOK = false;
    try {
      await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:countTokens?key=${process.env.GEMINI_API_KEY}`,
        { contents:[{parts:[{text:'ping'}]}] }
      );
      geminiOK = true;
    } catch { /* biar false */ }

    // 2. senarai command
    const slash = [...client.commands.keys()];
    const msg   = [...client.messageCommands.keys()];

    res.json({
      bot:        client.user.tag,
      guilds:     client.guilds.cache.size,
      users:      client.users.cache.size,
      ping:       `${client.ws.ping} ms`,
      gemini:     geminiOK ? 'online' : 'error',
      commands: {
        slash,         // [ 'help', 'leaderboard', ... ]
        message: msg   // [ 'ping', 'slot', ... ]
      },
      timestamp: new Date().toISOString()
    });
  });

  // ===== (optional) halaman HTML ringkas =====
  app.get('/', (_, res) => res.send(`
    <h1>${client.user.username} – Status</h1>
    <p>Lihat <a href="/status">/status</a> untuk JSON penuh.</p>
  `));

  app.listen(PORT, () =>
    console.log(`🌐 Status server up at http://localhost:${PORT}/status`)
  );
};