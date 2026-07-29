/**
 * config/db.js — MongoDB Atlas connection using Mongoose
 *
 * Connects to MongoDB Atlas using the MONGO_URI from .env.
 * Exits the process on connection failure to prevent a half-booted server.
 *
 * NOTE: We override Node.js DNS to use Google (8.8.8.8) + Cloudflare (1.1.1.1)
 * because some ISP DNS servers (e.g. BSNL) fail to resolve MongoDB SRV records.
 */

const mongoose = require('mongoose');
const dns      = require('dns');

// Safely set public DNS servers, fallback if restricted
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set error
}

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB Atlas DNS/Connection Failed: ${error.message}`);
    console.log('🔄 Failover: Connecting to Local MongoDB (mongodb://127.0.0.1:27017/placement-prep-portal)...');
    try {
      const localConn = await mongoose.connect(process.env.MONGODB_URI_LOCAL || 'mongodb://127.0.0.1:27017/placement-prep-portal', {
        serverSelectionTimeoutMS: 3000
      });
      console.log(`✅ Local MongoDB Connected: ${localConn.connection.host}`);
    } catch (localError) {
      console.error(`❌ Local MongoDB Connection Error: ${localError.message}`);
      console.error('\n========================================================================');
      console.error('DATABASE CONNECTION GUIDE:');
      console.error('1. Check internet connection for MongoDB Atlas.');
      console.error('2. Ensure your IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).');
      console.error('3. Or start local MongoDB service on port 27017.');
      console.error('========================================================================\n');
    }
  }
};

module.exports = connectDB;
