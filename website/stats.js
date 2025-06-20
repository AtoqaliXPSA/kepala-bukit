const uptimeEl = document.getElementById('uptime');
const pingEl = document.getElementById('ping');
const usersEl = document.getElementById('users');
const serversEl = document.getElementById('servers');
const ramEl = document.getElementById('ram');
const loadEl = document.getElementById('load');

const ctx = document.getElementById('pingChart').getContext('2d');
const pingChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Ping (ms)',
      data: [],
      borderColor: '#0f0',
      backgroundColor: 'rgba(0,255,0,0.2)',
      tension: 0.3
    }]
  },
  options: {
    scales: {
      x: { ticks: { color: '#0f0' } },
      y: { ticks: { color: '#0f0' } }
    },
    plugins: {
      legend: { labels: { color: '#0f0' } }
    }
  }
});

function updateStats(data) {
  uptimeEl.textContent = data.uptime_human;
  pingEl.textContent = data.ping + 'ms';
  usersEl.textContent = data.users;
  serversEl.textContent = data.guilds;
  ramEl.textContent = data.memory_usage_mb;
  loadEl.textContent = data.load_average.join(', ');

  const time = new Date().toLocaleTimeString();
  pingChart.data.labels.push(time);
  pingChart.data.datasets[0].data.push(data.ping);

  if (pingChart.data.labels.length > 20) {
    pingChart.data.labels.shift();
    pingChart.data.datasets[0].data.shift();
  }

  pingChart.update();
}

async function fetchStats() {
  try {
    const res = await fetch('/status.json');
    const data = await res.json();
    updateStats(data);
  } catch (err) {
    console.error('❌ Gagal fetch stats:', err);
  }
}

setInterval(fetchStats, 5000);
fetchStats();
