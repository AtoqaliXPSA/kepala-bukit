require('dotenv').config();
const axios = require('axios');

const url = process.env.SELF_URL || 'https://kepala-bukit.onrender.com'; // fallback default

// Fungsi untuk ping URL dengan retry logic
async function pingSite(retries = 3) {
  const now = new Date().toLocaleString('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour12: false,
  });

  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url);
      if (res.status === 200) {
        console.log(`[${now}] Ping success - Status ${res.status}`);
      } else {
        console.warn(`[${now}] Ping okay but status something wrong: ${res.status}`);
      }
      return;
    } catch (err) {
      console.error(`[${now}] Error ping (Testing ${i + 1}/${retries}): ${err.message}`);
      if (i < retries - 1) await new Promise(res => setTimeout(res, 2000)); // tunggu 2 saat
    }
  }

  console.error(`[${now}] All Testing to ping is fail.`);
}

// Ping setiap 5 minit
setInterval(pingSite, 5 * 60 * 1000);

// Jalankan sekali masa mula
pingSite();