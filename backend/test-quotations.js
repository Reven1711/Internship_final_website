const fetch = require("node-fetch");

async function testQuotationsAPI() {
  try {
    console.log("Testing quotations API...");

    // Test with a sample phone number from the data structure provided
    const response = await fetch(
      "http://localhost:5000/api/quotations/9234567891"
    );
    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ API test successful!");
      console.log(`Found ${data.count} quotations`);
    } else {
      console.log("❌ API test failed!");
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testQuotationsAPI();
