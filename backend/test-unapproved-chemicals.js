const fetch = require('node-fetch');

async function testUnapprovedChemicals() {
  try {
    console.log("🧪 Testing /api/unapproved-chemicals endpoint...");
    
    const response = await fetch('http://localhost:5000/api/unapproved-chemicals');
    const data = await response.json();
    
    console.log("📊 Response Status:", response.status);
    console.log("📋 Response Data:", JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✅ Success! Found ${data.count} unapproved chemicals`);
      if (data.requests && data.requests.length > 0) {
        console.log("\n📝 Unapproved Chemicals:");
        data.requests.forEach((req, index) => {
          console.log(`${index + 1}. ${req.name} (${req.email}) - ${req.status}`);
        });
      }
    } else {
      console.log("❌ Failed:", data.error);
    }
    
  } catch (error) {
    console.error("❌ Error testing endpoint:", error.message);
  }
}

testUnapprovedChemicals(); 