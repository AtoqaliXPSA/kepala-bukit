// statusServer.js
const express = require('express');
const fs       = require('fs');
const path     = require('path');

const router = express.Router();

// Helper – baca semua command .js di bawah /commands
function getAllCommands(dir, list = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) getAllCommands(full, list);
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      // cuba require() dgn selamat
      try {
        const cmd = require(full);
        list.push(cmd.name || entry.name.replace('.js', ''));
      } catch { /* abaikan error require */ }
    }
  }
  return list;
}

// -- ROUTE:  GET /status ---------------------------------------------
router.get('/', (req, res) => {

  // ========= OPTIONAL CLEAR CACHE =========
  if (req.query.clear === '1') {
    Object.keys(require.cache).forEach(k => delete require.cache[k]); // flush require cache
  }
  // ========================================

  const cmdNames = getAllCommands(path.join(__dirname, 'commands')).sort();

  // ------------- bina petak ASCII -------------
  const longest = cmdNames.reduce((m, n) => Math.max(m, n.length), 0);
  const horiz   = '—'.repeat(longest + 4);           // atas / bawah
  const rows    = cmdNames.map(n =>
    `| ${n.padEnd(longest)} |`).join('\n');

  const box = `\n${horiz}\n${rows}\n${'‾'.repeat(longest + 4)}\n`;

  res.type('text/plain').send(box);
});

module.exports = router;