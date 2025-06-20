// === website/stats.js ===
const ramChart = new Chart(document.getElementById('ramChart'), {
  type: 'doughnut',
  data: {
    labels: ['Digunakan (MB)', 'Baki (anggaran)'],
    datasets: [{
      data: [0, 0], // akan diisi kemudian
      backgroundColor: ['#0f0', '#333']
    }]
  },
  options: {
    plugins: { legend: { labels: { color: '#0f0' } } }
  }
});

// Update nilai RAM
setInterval(async () => {
  const res = await fetch('/status.json');
  const data = await res.json();
  const used = data.memory_usage_mb;
  const total = 512; // anggaran RAM bot
  const free = Math.max(total - used, 0);

  ramChart.data.datasets[0].data = [used, free];
  ramChart.update();
}, 3000); // Update setiap 3 saat

