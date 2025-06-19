// === website/stats.js ===
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/status.json');
    const data = await res.json();

    document.getElementById("uptime").textContent = data.uptime_human;
    document.getElementById("ping").textContent = data.ping || "N/A"; // kalau tiada
    document.getElementById("servers").textContent = data.guilds || "0";
    document.getElementById("users").textContent = data.users || "0";
    document.getElementById("ram").textContent = data.memory_usage_mb || "0";
    document.getElementById("loadavg").textContent = data.load_average?.join(', ') || "0, 0, 0";
  } catch (err) {
    alert("❌ Gagal memuatkan status bot.");
    console.error(err);
  }
});
