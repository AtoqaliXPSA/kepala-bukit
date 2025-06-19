// === website/login.js ===
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");
  document.getElementById("loginBtn").addEventListener("click", login);
  const registerLink = document.getElementById("register-link");
                                               

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("user", username);
    window.location.href = '/dashboard.html';
  } else {
    msg.textContent = data.message || "❌ Login gagal.";
    msg.style.color = 'red';

    // Tunjuk pautan daftar kalau username tak wujud
    if (data.message?.includes('tidak wujud')) {
      registerLink.style.display = 'block';
    } else {
      registerLink.style.display = 'none';
    }
  }
}