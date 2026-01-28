const mongoose = require("mongoose");

const dbConnect = async () => {
  const uri = process.env.MONGODB_URL;
  if (!uri) {
    console.error("MONGODB_URL not set in environment (.env) file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message || error);
    console.error(
      "Common causes: incorrect URI, wrong credentials, IP not whitelisted in Atlas, or TLS/network issues."
    );
    process.exit(1);
  }
};

module.exports = dbConnect;
