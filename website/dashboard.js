// === dashboard.js ===
document.addEventListener("DOMContentLoaded", () => {

  // 1. Semak sesi
  const user = sessionStorage.getItem("user");
  if (!user) {
    window.location.href = "/login.html";   // atau "/index.html" jika itu halaman login anda
    return;                                 // hentikan skrip selanjutnya
  }
  document.getElementById("user").textContent = user;

  // 2. Butang Status
  const statusBtn = document.getElementById("statusBtn");
  if (statusBtn) {
    statusBtn.addEventListener("click", () => {
      window.location.href = "/stats";      // route dinamik
    });
  }

  // 3. Butang Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("user");
      window.location.href = "/login.html"; // balik ke login
    });
  }

});
