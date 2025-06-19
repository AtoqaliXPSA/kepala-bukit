// === website/login.js ===
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");
  const registerLink = document.getElementById("register-link");
  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.textContent = "Logging in...";

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  console.log("Login response:", data);

  btn.disabled = false;
  btn.textContent = "Login";

  if (data.success) {
    sessionStorage.setItem("user", username);
    window.location.href = '/dashboard.html'; // ✅ tukar ke halaman anda
  } else {
    msg.textContent = data.message || "❌ Login gagal.";
    msg.style.color = 'red';
    registerLink.style.display = data.message?.includes('tidak wujud') ? 'block' : 'none';
  }
}
