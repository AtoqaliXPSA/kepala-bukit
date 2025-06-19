// keepAlive.js
// === keepAlive.js ===
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const os = require('os');
const fs = require('fs');
const path = require('path');

function formatDuration(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function keepAlive(client) {
  const app = express();
  const startTime = Date.now();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src-attr": ["'unsafe-inline'"]
        }
      }
    })
  );
  app.use(express.json());

  // Global rate limiter
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { error: '🚫 Too many requests. Try again later.' }
  }));

  // Login limiter
  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: '🚫 Terlalu banyak percubaan login. Cuba semula selepas 10 minit.'
  });

  // Rate limiter untuk register
  const registerLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: '⚠️ Terlalu banyak cubaan register. Cuba lagi selepas 10 minit.',
  });

  app.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('data/userDB.json'));
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ success: false, message: '❌ Username tidak wujud' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        return res.json({ success: true, message: '✅ Login berjaya' });
      } else {
        return res.status(401).json({ success: false, message: '❌ Password salah' });
      }
    });
  });

  app.post('/register', registerLimiter, async (req, res) => {
    const { username, password } = req.body;
    const dbPath = path.join(__dirname, 'data', 'userDB.json');

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '❌ Username dan password diperlukan.' });
    }

    const users = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath)) : [];
    const exists = users.find(u => u.username === username);

    if (exists) {
      return res.status(409).json({ success: false, message: '⚠️ Username sudah wujud.' });
    }

    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });

    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    return res.json({ success: true, message: '✅ Akaun berjaya didaftarkan!' });
  });

  app.use((req, res, next) => {
    const ua = req.get('User-Agent') || '';
    if (/curl|wget|python|bot|scan/i.test(ua)) {
      return res.status(403).send('Forbidden');
    }
    next();
  });

  app.get('/', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    const htmlPath = path.join(__dirname, 'website', 'index.html');

    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) return res.status(500).send('⚠️ HTML Error');

      html = html
        .replace('{{uptime}}', formatDuration(uptimeSec))
        .replace('{{ping}}', `${client.ws.ping}ms`)
        .replace('{{servers}}', client.guilds.cache.size)
        .replace('{{users}}', client.users.cache.size)
        .replace('{{ram}}', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))
        .replace('{{loadavg}}', os.loadavg().map(n => n.toFixed(2)).join(', '))
        .replace('{{owner}}', 'AtoqaliXPSA');

      res.send(html);
    });
  });

  app.use(express.static(path.join(__dirname, 'website')));

  app.get('/status.json', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime_seconds: uptimeSec,
      uptime_human: formatDuration(uptimeSec),
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      memory_usage_mb: +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      load_average: os.loadavg().map(n => +n.toFixed(2))
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🟢 Website running on port ${PORT}`);
  });
}

module.exports = keepAlive;