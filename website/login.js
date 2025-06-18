async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

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