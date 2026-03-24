require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");

const connectDB = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    const adminEmail = "admin@synrx.com";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Admin already exists:", adminEmail);
      return;
    }

    // Create new admin
    const admin = await User.create({
      fullName: "Admin User",
      email: adminEmail,
      password: "Admin@123456", // Change this in production
      roles: "faculty", // Faculty role = Admin in your system
      isVerified: true,
      isApproved: true,
      approvalStatus: "approved",
      phone: "9999999999",
      department: "CSE",
      specialization: "Administration",
    });

    console.log("✅ Admin created successfully!");
    console.log("\n📝 Admin Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: Admin@123456`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("URL: http://localhost:5173/admin/login");
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
};

const run = async () => {
  await connectDB();
  await createAdmin();
  process.exit(0);
};

run();
