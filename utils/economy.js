// helpers/economy.js
const User = require('../models/User'); // Pastikan model user MongoDB

async function getUserData(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({
      userId,
      wallet: 0,
      stamina: 5,
      lastRegen: Date.now()
    });
  }

  // Regen stamina setiap 10 minit
  const now = Date.now();
  const elapsed = now - user.lastRegen;
  const regenRate = 10 * 60 * 1000; // 10 minit

  if (user.stamina < 5 && elapsed >= regenRate) {
    const regen = Math.floor(elapsed / regenRate);
    user.stamina = Math.min(5, user.stamina + regen);
    user.lastRegen = now;
    await user.save();
  }

  return user;
}

async function addCoins(userId, amount) {
  const user = await getUserData(userId);
  user.wallet += amount;
  await user.save();
}

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