const fetch = require('node-fetch');

async function testCompanyFiltering() {
  const email = 'jay.r1@ahduni.edu.in';
  const baseUrl = 'http://localhost:5000';
  
  console.log("🧪 Testing Company Filtering for Buy Products...\n");
  
  // Test 1: Fetch without company filters (old way)
  console.log("1️⃣ Testing fetch without company filters (old way)...");
  try {
    const response1 = await fetch(`${baseUrl}/api/buy-products/${encodeURIComponent(email)}`);
    const data1 = await response1.json();
    console.log(`   ✅ Response: ${data1.success ? 'Success' : 'Failed'}`);
    console.log(`   📊 Products found: ${data1.count}`);
    console.log(`   📋 Products:`, data1.products || []);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Fetch with company filters (new way)
  console.log("\n2️⃣ Testing fetch with company filters (new way)...");
  try {
    const phoneNumber = '9313301345';
    const companyName = 'JAY reliance';
    const url = `${baseUrl}/api/buy-products/${encodeURIComponent(email)}?phoneNumber=${phoneNumber}&companyName=${encodeURIComponent(companyName)}`;
    
    console.log(`   🌐 URL: ${url}`);
    
    const response2 = await fetch(url);
    const data2 = await response2.json();
    console.log(`   ✅ Response: ${data2.success ? 'Success' : 'Failed'}`);
    console.log(`   📊 Products found: ${data2.count}`);
    console.log(`   📋 Products:`, data2.products || []);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Fetch with different company name (should return empty)
  console.log("\n3️⃣ Testing fetch with different company name (should return empty)...");
  try {
    const phoneNumber = '9313301345';
    const companyName = 'Jay Microsoft'; // Different company
    const url = `${baseUrl}/api/buy-products/${encodeURIComponent(email)}?phoneNumber=${phoneNumber}&companyName=${encodeURIComponent(companyName)}`;
    
    console.log(`   🌐 URL: ${url}`);
    
    const response3 = await fetch(url);
    const data3 = await response3.json();
    console.log(`   ✅ Response: ${data3.success ? 'Success' : 'Failed'}`);
    console.log(`   📊 Products found: ${data3.count}`);
    console.log(`   📋 Products:`, data3.products || []);
    
    if (data3.count === 0) {
      console.log(`   ✅ CORRECT: No products found for different company`);
    } else {
      console.log(`   ❌ ISSUE: Products found for different company`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log("\n🎯 Summary:");
  console.log("   - Test 1: Should show all products for the email (old behavior)");
  console.log("   - Test 2: Should show products for specific company");
  console.log("   - Test 3: Should show no products for different company");
  console.log("\n💡 If Test 3 returns products, the filtering is not working correctly!");
}

testCompanyFiltering(); 