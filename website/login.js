// === website/login.js ===
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("password").value = "";

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");
  const registerLink = document.getElementById("register-link");
  const btn = document.getElementById("loginBtn");

  btn.disabled = true;
  btn.textContent = "Logging in...";

  if (!username || !password) {
    msg.textContent = "❗ Sila isi semua medan.";
    msg.style.color = "orange";
    btn.disabled = false;
    btn.textContent = "Login";
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem("user", username);
      window.location.href = '/dashboard.html';
    } else {
      msg.textContent = data.message || "❌ Login gagal.";
      msg.style.color = 'red';

      if (data.message?.includes('tidak wujud')) {
        registerLink.style.display = 'block';
      } else {
        registerLink.style.display = 'none';
      }
    }
  } catch (err) {
    msg.textContent = "⚠️ Gagal sambung ke server.";
    msg.style.color = "red";
  }

  btn.disabled = false;
  btn.textContent = "Login";
}
