import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/typerush';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct MongoDB connection failed: ${error.message}`);
    console.log('[MongoDB Fallback] Starting in-memory MongoDB server for seamless localhost development...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB Fallback] Connected to in-memory database at ${inMemoryUri}`);
      return conn;
    } catch (memError) {
      console.error('[MongoDB Error] Failed to initialize in-memory database:', memError.message);
      return null;
    }
  }
};
