// === keepAlive.js ===
require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const os = require('os');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fetch = require('node-fetch');

function formatDuration(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function keepAlive(client) {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}`;
  const startTime = Date.now();

  // ── Trust proxy ──
  app.set('trust proxy', 1);

  // ── Helmet Security ──
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", "data:", "https://cdn.discordapp.com", "https://i.imgur.com"],
          objectSrc: ["'none'"],
        }
      }
    })
  );

  app.use(express.json());

  // ── Rate Limit ──
  app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { error: '🚫 Too many requests. Try again later.' }
  }));

  // ── Session MongoDB ──
  app.use(session({
    secret: process.env.SESSION_SECRET || 'djbot',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    }),
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 }
  }));

  // ── Auth Middleware ──
  function checkAuth(req, res, next) {
    if (req.session && req.session.user) return next();
    res.redirect('/stats.html');
  }

  // ── Login ──
  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: '🚫 Terlalu banyak percubaan login. Cuba semula selepas 10 minit.'
  });

  app.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('data/userDB.json', 'utf8') || '[]');
    const user = users.find(u => u.username === username);

    if (!user) return res.status(401).json({ success: false, message: '❌ Username tidak wujud' });

    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        req.session.user = username;
        return res.json({ success: true, message: '✅ Login berjaya' });
      }
      return res.status(401).json({ success: false, message: '❌ Password salah' });
    });
  });

  // ── Restart Bot ──
  app.post('/restart', (req, res) => {
    if (!req.session || req.session.user !== 'admin1') {
      return res.status(403).json({ message: '❌ Unauthorized' });
    }
    console.log('🔁 Restart requested');
    res.status(200).json({ message: 'Restarting bot...' });
    setTimeout(() => process.exit(0), 1000);
  });

  // ── Block Suspicious User-Agent ──
  app.use((req, res, next) => {
    const ua = req.get('User-Agent') || '';
    if (/curl|wget|python|bot|scan/i.test(ua)) return res.status(403).send('Forbidden');
    next();
  });

  // ── Stats HTML ──
  app.get('/stats', checkAuth, (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    const htmlPath = path.join(__dirname, 'website', 'stats.html');

    fs.readFile(htmlPath, 'utf8', (err, html) => {
      if (err) return res.status(500).send('⚠️ HTML Error');
      html = html
        .replace('{{uptime}}', formatDuration(uptimeSec))
        .replace('{{ping}}', `${client.ws.ping ?? 0}ms`)
        .replace('{{servers}}', client.guilds.cache.size)
        .replace('{{users}}', client.users.cache.size)
        .replace('{{ram}}', (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2))
        .replace('{{loadavg}}', os.loadavg().map(n => n.toFixed(2)).join(', '))
        .replace('{{owner}}', 'AtoqaliXPSA');
      res.send(html);
    });
  });

  // ── Status JSON ──
  app.get('/status.json', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime_seconds: uptimeSec,
      uptime_human: formatDuration(uptimeSec),
      ping: client.ws.ping,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      memory_usage_mb: +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      load_average: os.loadavg().map(n => +n.toFixed(2))
    });
  });

  // ── Static files ──
  app.use(express.static(path.join(__dirname, 'website')));

  // ── Start Server ──
  app.listen(PORT, () => console.log(`🟢 Website running on port ${PORT}`));

  // ── KeepAlive Ping ──
  setInterval(async () => {
    try {
      await fetch(SELF_URL);
      console.log('[SENT] KeepAlive ping.');
    } catch (err) {
      console.error('[ERROR] KeepAlive ping failed:', err);
    }
  }, 5 * 60 * 1000);

  // ── Watchdog ──
  setInterval(() => {
    if (!client?.isReady() || client.ws?.status !== 0) {
      console.warn('[ERROR] Bot not ready! Restarting...');
      process.exit(1);
    }
  }, 15 * 60 * 1000); //
}

module.exports = keepAlive;