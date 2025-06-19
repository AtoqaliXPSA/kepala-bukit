app.get('/stats', checkAuth, (req, res) => {
  const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
  const htmlPath = path.join(__dirname, 'website', 'stats.html');

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

    app.get('/logout', (req, res) => {
      req.session.destroy(() => {
        res.redirect('/login.html');
      });
    });

    res.send(html);
  });
});
