const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function testSellProducts() {
  try {
    console.log("🧪 Testing Sell Products with Three Fields");
    console.log("==========================================");

    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Test data
    const testEmail = "jaymr@gmail.com";
    const testPhone1 = "6352615629"; // Jay Reliance
    const testPhone2 = "9876543210"; // Jay Microsoft
    const testCompany1 = "Jay Reliance";
    const testCompany2 = "Jay Microsoft";

    console.log("\n📋 Test Data:");
    console.log(`Email: ${testEmail}`);
    console.log(`Company 1: ${testCompany1} (Phone: ${testPhone1})`);
    console.log(`Company 2: ${testCompany2} (Phone: ${testPhone2})`);

    // Test 1: Check existing sell products for Jay Reliance
    console.log("\n🔍 Test 1: Checking sell products for Jay Reliance");
    const filter1 = {
      "Seller Email Address": { $eq: testEmail },
      "Seller Name": { $eq: testCompany1 },
      "Seller POC Contact Number": { $eq: testPhone1 },
    };

    const response1 = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter1,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${response1.matches?.length || 0} sell products for Jay Reliance`);
    if (response1.matches && response1.matches.length > 0) {
      response1.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.metadata["Product Name"]} (ID: ${match.metadata["Product ID"]})`);
      });
    }

    // Test 2: Check existing sell products for Jay Microsoft
    console.log("\n🔍 Test 2: Checking sell products for Jay Microsoft");
    const filter2 = {
      "Seller Email Address": { $eq: testEmail },
      "Seller Name": { $eq: testCompany2 },
      "Seller POC Contact Number": { $eq: testPhone2 },
    };

    const response2 = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter2,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${response2.matches?.length || 0} sell products for Jay Microsoft`);
    if (response2.matches && response2.matches.length > 0) {
      response2.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.metadata["Product Name"]} (ID: ${match.metadata["Product ID"]})`);
      });
    }

    // Test 3: Check all sell products for the email (without company filters)
    console.log("\n🔍 Test 3: Checking all sell products for email (no company filters)");
    const filter3 = {
      "Seller Email Address": { $eq: testEmail },
    };

    const response3 = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter3,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${response3.matches?.length || 0} total sell products for email`);
    if (response3.matches && response3.matches.length > 0) {
      const companies = new Map();
      response3.matches.forEach((match) => {
        const companyName = match.metadata["Seller Name"];
        const contact = match.metadata["Seller POC Contact Number"];
        const productName = match.metadata["Product Name"];
        
        if (!companies.has(companyName)) {
          companies.set(companyName, { contact, products: [] });
        }
        companies.get(companyName).products.push(productName);
      });

      companies.forEach((data, company) => {
        console.log(`  ${company} (${data.contact}): ${data.products.length} products`);
        data.products.forEach((product, index) => {
          console.log(`    ${index + 1}. ${product}`);
        });
      });
    }

    console.log("\n✅ Sell Products Test Completed");

  } catch (error) {
    console.error("❌ Error testing sell products:", error);
  }
}

// Run the test
testSellProducts(); 