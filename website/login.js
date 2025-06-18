// === website/login.js ===
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem("user", username);
      window.location.href = "/dashboard.html";
    } else {
      msg.textContent = data.message || data.error || "❌ Login gagal";
    }
  } catch (err) {
    console.error("Login Error:", err);
    msg.textContent = "❌ Ralat sambungan ke server";
  }
}