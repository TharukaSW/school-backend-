const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/school_management';

async function connectWithUri(uri) {
  mongoose.set('strictQuery', true);

  if (mongoose.connection.listenerCount('error') === 0) {
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error.message);
    });
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || LOCAL_URI;

  try {
    const connection = await connectWithUri(uri);
    console.log('MongoDB connected:', connection.name);
    return connection;
  } catch (primaryError) {
    const shouldTryLocal = uri !== LOCAL_URI;

    if (!shouldTryLocal) {
      throw primaryError;
    }

    console.warn('Primary MongoDB connection failed, trying local MongoDB...');

    try {
      const connection = await connectWithUri(LOCAL_URI);
      console.log('MongoDB connected:', connection.name);
      return connection;
    } catch (fallbackError) {
      const error = new Error(
        `Failed to connect to MongoDB using the configured URI and the local fallback. Primary error: ${primaryError.message}. Fallback error: ${fallbackError.message}`
      );
      error.cause = fallbackError;
      throw error;
    }
  }
}

module.exports = connectDB;
