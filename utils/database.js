const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log('🟢 MongoDB is connected !');
  } catch (err) {
    console.error('❌ Error connect MongoDB:', err);
  }
}

module.exports = connectDB;
