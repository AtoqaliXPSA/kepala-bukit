async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const rateLimit = require('express-rate-limit');

  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: '⚠️ Terlalu banyak cubaan login, cuba sebentar lagi.',
  });

  app.use('/login', loginLimiter);

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  const msg = document.getElementById('msg');

  if (data.success) {
    localStorage.setItem("user", username);
    location.href = '/dashboard.html';
  } else {
    msg.textContent = data.message;
    msg.style.color = 'red';
  }
}