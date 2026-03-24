require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");

const resetAdminPassword = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB connected successfully\n");

    const admin = await User.findOne({ email: "admin@synrx.com" });
    
    if (!admin) {
      console.error("❌ Admin not found!");
      process.exit(1);
    }

    // Reset password to a simple one
    admin.password = "Admin@123456";
    await admin.save();

    console.log("✅ Admin password reset successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email:    admin@synrx.com`);
    console.log(`Password: Admin@123456`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🔗 Login URL: http://localhost:5173/admin/login");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

resetAdminPassword();
