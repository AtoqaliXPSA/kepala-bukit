const User = require('../models/User');

// 🧠 Ambil atau cipta data user + auto regen stamina
async function getUserData(userId) {
  let user = await User.findOne({ userId });
  const now = Date.now();

  if (!user) {
    user = await User.create({
      userId,
      balance: 0,
      stamina: 5,
      lastRegen: now
    });
    return user;
  }

  // 🌱 Auto regen stamina setiap 5 minit
  const regenRate = 5 * 60 * 1000; // 5 minit dalam ms
  const elapsed = now - user.lastRegen;

  if (user.stamina < 5 && elapsed >= regenRate) {
    const regen = Math.floor(elapsed / regenRate);
    user.stamina = Math.min(5, user.stamina + regen);
    user.lastRegen = now;
    await user.save();
  }

  return user;
}

// 💰 Tambah coins kepada user
async function addCoins(userId, amount) {
  const user = await getUserData(userId);
  user.balance += amount;
  await user.save();
}

// ⚡ Tolak stamina semasa guna command
async function useStamina(userId) {
  const user = await getUserData(userId);
  if (user.stamina <= 0) return false;

  user.stamina -= 1;
  await user.save();
  return true;
}

module.exports = {
  getUserData,
  addCoins,
  useStamina
};