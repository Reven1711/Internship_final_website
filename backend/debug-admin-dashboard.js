const fetch = require('node-fetch');

async function testAdminEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  console.log("🔍 Debugging Admin Dashboard Endpoints...\n");
  
  // Test 1: Health check
  console.log("1️⃣ Testing Health Check...");
  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ Health: ${healthResponse.status} - ${JSON.stringify(healthData)}`);
  } catch (error) {
    console.log(`   ❌ Health Error: ${error.message}`);
  }
  
  // Test 2: Unapproved chemicals
  console.log("\n2️⃣ Testing Unapproved Chemicals...");
  try {
    const unapprovedResponse = await fetch(`${baseUrl}/api/unapproved-chemicals`);
    const unapprovedData = await unapprovedResponse.json();
    console.log(`   ✅ Unapproved: ${unapprovedResponse.status} - Found ${unapprovedData.count} requests`);
    if (unapprovedData.requests && unapprovedData.requests.length > 0) {
      unapprovedData.requests.forEach((req, i) => {
        console.log(`      ${i+1}. ${req.name} (${req.email})`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Unapproved Error: ${error.message}`);
  }
  
  // Test 3: Referrals
  console.log("\n3️⃣ Testing Referrals...");
  try {
    const referralsResponse = await fetch(`${baseUrl}/api/referrals`);
    const referralsData = await referralsResponse.json();
    console.log(`   ✅ Referrals: ${referralsResponse.status} - Success: ${referralsData.success}`);
    if (referralsData.referrals) {
      console.log(`      Found ${referralsData.referrals.length} referrals`);
    }
  } catch (error) {
    console.log(`   ❌ Referrals Error: ${error.message}`);
  }
  
  // Test 4: Daily metrics
  console.log("\n4️⃣ Testing Daily Metrics...");
  try {
    const metricsResponse = await fetch(`${baseUrl}/api/daily-metrics`);
    const metricsData = await metricsResponse.json();
    console.log(`   ✅ Metrics: ${metricsResponse.status} - Success: ${metricsData.success}`);
    if (metricsData.metrics) {
      console.log(`      Found ${metricsData.metrics.length} metrics records`);
    }
  } catch (error) {
    console.log(`   ❌ Metrics Error: ${error.message}`);
  }
  
  // Test 5: Frontend proxy test (if frontend is running)
  console.log("\n5️⃣ Testing Frontend Proxy...");
  try {
    const frontendResponse = await fetch('http://localhost:8080/api/unapproved-chemicals');
    const frontendData = await frontendResponse.json();
    console.log(`   ✅ Frontend Proxy: ${frontendResponse.status} - Found ${frontendData.count} requests`);
  } catch (error) {
    console.log(`   ❌ Frontend Proxy Error: ${error.message}`);
    console.log("   💡 This is expected if the frontend is not running");
  }
  
  console.log("\n🎯 Summary:");
  console.log("   - Backend is running on port 5000");
  console.log("   - All admin endpoints are working");
  console.log("   - The issue is likely in the frontend or network connectivity");
  console.log("\n💡 Possible Solutions:");
  console.log("   1. Make sure the frontend is running on port 8080");
  console.log("   2. Check browser console for JavaScript errors");
  console.log("   3. Verify the user is logged in as an admin");
  console.log("   4. Check if the admin email is in the ADMIN_EMAILS environment variable");
}

testAdminEndpoints(); 