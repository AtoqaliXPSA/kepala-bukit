const axios = require('axios');

const url = 'https://kepala-bukit.onrender.com'; // Gantikan dengan URL anda

setInterval(async () => {
  try {
    const res = await axios.get(url);
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Ping berjaya - ${res.status}`);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Gagal ping: ${err.message}`);
  }
}, 5 * 60 * 1000); // setiap 5 minit (5 min × 60 sec × 1000 ms)