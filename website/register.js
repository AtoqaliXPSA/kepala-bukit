async function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('msg');

  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    msg.style.color = 'lime';
    msg.textContent = data.message;
    setTimeout(() => window.location.href = '/index.html', 1500);
  } else {
    msg.style.color = 'red';
    msg.textContent = data.message;
  }
}