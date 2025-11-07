require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

function connectDB() {
  if (!uri) {
    console.error('Missing MONGO_URI in .env');
    process.exit(1);
  }

  return mongoose
    .connect(uri) // v8: no extra options needed
    .then(() => console.log('MongoDB connected'))
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    });
}

async function closeDB() {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
}

module.exports = { connectDB, closeDB };
