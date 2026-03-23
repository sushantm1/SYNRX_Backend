const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  console.log("Testing MongoDB connection...");
  console.log("URI:", process.env.MONGODB_URL?.replace(/:[^@]*@/, ":****@")); // Hide password
  
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 5000,
      retryWrites: false,
    });
    console.log("✓ Connection successful!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("✗ Connection failed:");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    
    if (error.message.includes("ENOTFOUND")) {
      console.error("\n→ DNS resolution failed. Check if synrxdb.vemayvo.mongodb.net is reachable");
    }
    if (error.message.includes("IP")) {
      console.error("\n→ Your IP is likely not whitelisted in MongoDB Atlas");
    }
  }
};

testConnection();
