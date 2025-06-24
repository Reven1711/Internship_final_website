const fetch = require("node-fetch");

async function testInquiriesAPI() {
  try {
    console.log("Testing inquiries API...");

    // Test with a sample phone number from the data structure provided
    const response = await fetch(
      "http://localhost:5000/api/inquiries/9234567891"
    );
    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ API test successful!");
      console.log(`Found ${data.count} inquiries`);
      if (data.matchedFormat) {
        console.log(`Matched format: ${data.matchedFormat}`);
      }
    } else {
      console.log("❌ API test failed!");
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testInquiriesAPI();
