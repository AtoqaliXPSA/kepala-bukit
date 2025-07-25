const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log('🟢 MongoDB is Connected !');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
}

module.exports = connectDB;
