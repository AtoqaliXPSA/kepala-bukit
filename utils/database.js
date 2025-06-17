const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log('🟢 MongoDB berjaya disambung!');
  } catch (err) {
    console.error('❌ Gagal sambung MongoDB:', err);
  }
}

module.exports = connectDB;
