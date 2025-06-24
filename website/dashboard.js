// === dashboard.js ===
document.addEventListener("DOMContentLoaded", () => {
  // 1. Semak sesi
  const user = sessionStorage.getItem("user");
  if (!user) {
    window.location.href = "/login.html";
    return;
  }
  document.getElementById("user").textContent = user;

  // 2. Butang Status
  const statusBtn = document.getElementById("statusBtn");
  if (statusBtn) {
    statusBtn.addEventListener("click", () => {
      window.location.href = "/stats";
    });
  }

  // 3. Butang Restart
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", async () => {
      const confirmed = confirm("Anda pasti nak restart bot?");
      if (!confirmed) return;

      try {
        const res = await fetch('/restart', { method: 'POST' });
        const data = await res.json();
        alert(data.message || 'Restart triggered.');
      } catch (err) {
        alert("❌ Gagal restart bot.");
      }
    });
  }

  // 4. Butang Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("user");
      window.location.href = "/login.html";
    });
  }
});