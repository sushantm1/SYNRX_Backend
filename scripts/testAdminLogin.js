require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const axios = require("axios");

const testAdminLogin = async () => {
  try {
    console.log("🔌 Testing admin login...\n");

    const response = await axios.post("http://localhost:4000/api/auth/login", {
      email: "admin@synrx.com",
      password: "Admin@123456",
      role: "faculty",
    });

    console.log("✅ Login successful!");
    console.log("\n📋 Response:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (response.data.user) {
      console.log("\n👤 User Details:");
      console.log(`   Email: ${response.data.user.email}`);
      console.log(`   Role:  ${response.data.user.roles}`);
      console.log(`   Approved: ${response.data.user.isApproved}`);
    }
  } catch (err) {
    console.error("❌ Login failed!");
    console.error("\n🔴 Error:");
    console.error(err.response?.data || err.message);
  }
};

testAdminLogin();
