const User = require('../models/User');

async function getUserData(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({
      userId,
      balance: 0, // <-- tukar sini
      stamina: 5,
      lastRegen: Date.now()
    });
  }

  const now = Date.now();
  const elapsed = now - user.lastRegen;
  const regenRate = 10 * 60 * 1000;

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
  user.balance += amount; // <-- fix field name
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
