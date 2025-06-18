// helpers/economy.js
const User = require('../models/User');

async function getUser(userId) {
  let user = await User.findOne({ userId });
  if (!user) {
    user = await User.create({ userId });
  }
  return user;
}

addBalance: async (userId, amount) => {
    const user = await User.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );
    return user;
  }
};

module.exports = { getUser };