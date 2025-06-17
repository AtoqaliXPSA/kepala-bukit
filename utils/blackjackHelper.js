const User = require('../models/User');

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId });
  }
  return user;
}

async function addBalance(userId, amount) {
  const user = await getUser(userId);
  user.balance += amount;
  await user.save();
  return user;
}

async function subtractBalance(userId, amount) {
  const user = await getUser(userId);
  user.balance -= amount;
  if (user.balance < 0) user.balance = 0;
  await user.save();
  return user;
}

module.exports = {
  getUser,
  addBalance,
  subtractBalance
};
