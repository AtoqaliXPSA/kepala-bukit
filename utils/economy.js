// helpers/economy.js
const User = require('../models/User');

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId });
  }
  return user;
}

module.exports = { getUser };