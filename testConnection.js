const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  console.log('Testing MongoDB Atlas connection...');
  console.log('URI:', process.env.MONGODB_URL ? process.env.MONGODB_URL.substring(0, 50) + '...' : 'NOT SET');
  
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✓ Connected to MongoDB Atlas successfully!');
    
    // Test a ping to the database
    const admin = mongoose.connection.db.admin();
    const status = await admin.ping();
    console.log('✓ Database ping successful:', status);
    
    console.log('✓ Database is running perfectly!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('\nFix checklist:');
    console.error('1. Whitelist your IP in MongoDB Atlas → Network Access');
    console.error('2. Verify MONGODB_URL credentials in .env match Atlas user');
    console.error('3. Disable VPN/corporate proxy and retry');
    console.error('4. Check if port 27017 is open (firewall)');
    process.exit(1);
  }
})();
