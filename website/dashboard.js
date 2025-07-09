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

  // 3. Butang Logout
 document.getElementById("restartBtn").onclick = async () => {
    const confirmRestart = confirm("Anda pasti nak restart bot?");
    if (!confirmRestart) return;

    const overlay = document.getElementById("restartOverlay");
    overlay.style.display = "flex"; // Tunjuk overlay

    try {
      const res = await fetch('/restart', { method: 'POST' });
      const data = await res.json();

      setTimeout(() => {
        overlay.style.display = "none"; // Hilangkan selepas beberapa saat (optional)
        alert(data.message || "Restart triggered.");
      }, 3000); // contoh 3 saat
    } catch (err) {
      overlay.style.display = "none";
      alert("❌ Gagal restart bot.");
    }
  };


  // 4. Butang Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("user");
      window.location.href = "/login.html";
    });
  }
});