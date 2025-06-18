async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!username || !password) {
    msg.textContent = "⚠️ Sila isi semua ruangan.";
    msg.style.color = "orange";
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
      localStorage.setItem("user", username);
      window.location.href = '/dashboard.html';
    } else {
      msg.textContent = data.message || '❌ Login gagal.';
      msg.style.color = "red";
    }
  } catch (err) {
    msg.textContent = "❌ Ralat sambungan ke server.";
    msg.style.color = "red";
  }
}