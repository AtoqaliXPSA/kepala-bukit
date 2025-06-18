// keepAlive.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const os = require('os');

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
  app.use(helmet());

  app.use(rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { error: '🚫 Too many requests. Try again later.' }
  }));

  app.use((req, res, next) => {
    const ua = req.get('User-Agent') || '';
    if (/curl|wget|python|bot|scan/i.test(ua)) {
      return res.status(403).send('Forbidden');
    }
    next();
  });

  app.use(express.static('website'));

  app.get('/', (req, res) => {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bot Status</title>
          <style>
            :root {
              --bg-color: #111;
              --text-color: #0f0;
              --card-bg: #1a1a1a;
              --card-border: #0f0;
              --shadow: #0f04;
            }

            body.light {
              --bg-color: #f5f5f5;
              --text-color: #111;
              --card-bg: #fff;
              --card-border: #333;
              --shadow: rgba(0, 0, 0, 0.1);
            }

            body {
              margin: 0;
              padding: 0;
              background: var(--bg-color);
              color: var(--text-color);
              font-family: 'Segoe UI', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              transition: background 0.3s, color 0.3s;
            }

            .card {
              background: var(--card-bg);
              border: 2px solid var(--card-border);
              border-radius: 16px;
              padding: 2rem 3rem;
              box-shadow: 0 0 30px var(--shadow);
              text-align: center;
              max-width: 400px;
              width: 100%;
              opacity: 0;
              transform: translateY(20px);
              animation: fadeInUp 1s ease-out forwards;
              transition: background 0.3s, border 0.3s, color 0.3s;
            }

            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            h1, p, .footer {
              text-shadow: 0 0 5px var(--text-color);
            }

            .footer {
              margin-top: 1rem;
              font-size: 0.85rem;
              color: inherit;
            }

            .toggle {
              position: absolute;
              top: 20px;
              right: 20px;
              cursor: pointer;
              background: none;
              border: 2px solid var(--text-color);
              border-radius: 20px;
              padding: 6px 12px;
              font-size: 0.9rem;
              color: var(--text-color);
              background-color: transparent;
              transition: all 0.3s ease;
            }

            .toggle:hover {
              background-color: var(--card-border);
              color: var(--bg-color);
            }
          </style>
        </head>
        <body>
          <button class="toggle" onclick="toggleMode()">🌓 Toggle Theme</button>
          <div class="card">
            <h1> Bot is Alive</h1>
            <p>🕒 Uptime: ${formatDuration(uptimeSec)}</p>
            <p>📶 Ping: ${client.ws.ping}ms</p>
            <p>🌍 Server: ${client.guilds.cache.size}</p>
            <p>👥 Users: ${client.users.cache.size}</p>
            <p>💾 RAM Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB</p>
            <p>⚙️ Load Avg: ${os.loadavg().map(n => n.toFixed(2)).join(', ')}</p>
            <div class="footer"> Owner Bot: AtoqaliXPSA</div>
          </div>

          <script src="/themeToggle.js"></script>

        </body>
      </html>
    `);
  });



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
      load_average: os.loadavg().map(n => +n.toFixed(2)) // 1min, 5min, 15min
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🟢 Server running on port ${PORT}`);
  });
}

module.exports = keepAlive;