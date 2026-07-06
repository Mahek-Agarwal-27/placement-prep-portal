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

// ── DNS Override ──────────────────────────────────────────────────────────────
// Force Node.js to use reliable public DNS servers instead of the system ISP DNS
// which may not correctly resolve MongoDB Atlas SRV (_mongodb._tcp.*) records.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure so the process manager can restart it
    process.exit(1);
  }
};

module.exports = connectDB;
