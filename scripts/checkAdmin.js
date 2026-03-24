require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");

const checkAdmin = async () => {
  try {
    console.log("🔍 Checking admin user in database...\n");
    await mongoose.connect(process.env.MONGODB_URL);
    
    const admin = await User.findOne({ email: "admin@synrx.com" }).select("+password");
    
    if (!admin) {
      console.log("❌ Admin not found in database!");
      process.exit(1);
    }

    console.log("✅ Admin found! Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email:       ${admin.email}`);
    console.log(`Full Name:   ${admin.fullName}`);
    console.log(`Role:        ${admin.roles}`);
    console.log(`Verified:    ${admin.isVerified}`);
    console.log(`Approved:    ${admin.isApproved}`);
    console.log(`Status:      ${admin.approvalStatus}`);
    console.log(`Department:  ${admin.department}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Check if password matches
    const isPasswordCorrect = await admin.isPasswordMatched("Admin@123456");
    console.log(`\n🔑 Password correct: ${isPasswordCorrect ? "✅ YES" : "❌ NO"}`);

    if (!isPasswordCorrect) {
      console.log("\n⚠️  Password mismatch! Let me fix this...");
      admin.password = "Admin@123456";
      await admin.save();
      console.log("✅ Password updated to: Admin@123456");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

checkAdmin();
