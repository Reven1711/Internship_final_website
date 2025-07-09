const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function addTestSellProducts() {
  try {
    console.log("🧪 Adding Test Sell Products with Three Fields");
    console.log("==============================================");

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

    // First, check if we have profile data for both companies
    console.log("\n🔍 Checking profile data for both companies...");

    // Check Jay Reliance profile
    const profileFilter1 = {
      "Seller Email Address": { $eq: testEmail },
      "Seller Name": { $eq: testCompany1 },
      "Seller POC Contact Number": { $eq: testPhone1 },
    };

    const profileResponse1 = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: profileFilter1,
      topK: 1,
      includeMetadata: true,
    });

    if (!profileResponse1.matches || profileResponse1.matches.length === 0) {
      console.log("❌ No profile data found for Jay Reliance. Creating profile first...");
      
      // Create a basic profile for Jay Reliance
      const profileId1 = `profile_${Date.now()}_reliance`;
      await index.namespace("chemicals").upsert([
        {
          id: profileId1,
          values: dummyVector,
          metadata: {
            "Seller Name": testCompany1,
            "Seller Email Address": testEmail,
            "Seller POC Contact Number": testPhone1,
            "Seller Address": "Mumbai, Maharashtra",
            "Region": "Maharashtra",
            "Seller Verified": true,
            "Seller Rating": 4.5,
            "PIN Code": "400001",
            "Product Address": "Mumbai, Maharashtra",
            "GST Number": "27AABCJ1234A1Z5",
          },
        },
      ]);
      console.log("✅ Created profile for Jay Reliance");
    } else {
      console.log("✅ Profile data found for Jay Reliance");
    }

    // Check Jay Microsoft profile
    const profileFilter2 = {
      "Seller Email Address": { $eq: testEmail },
      "Seller Name": { $eq: testCompany2 },
      "Seller POC Contact Number": { $eq: testPhone2 },
    };

    const profileResponse2 = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: profileFilter2,
      topK: 1,
      includeMetadata: true,
    });

    if (!profileResponse2.matches || profileResponse2.matches.length === 0) {
      console.log("❌ No profile data found for Jay Microsoft. Creating profile first...");
      
      // Create a basic profile for Jay Microsoft
      const profileId2 = `profile_${Date.now()}_microsoft`;
      await index.namespace("chemicals").upsert([
        {
          id: profileId2,
          values: dummyVector,
          metadata: {
            "Seller Name": testCompany2,
            "Seller Email Address": testEmail,
            "Seller POC Contact Number": testPhone2,
            "Seller Address": "Bangalore, Karnataka",
            "Region": "Karnataka",
            "Seller Verified": true,
            "Seller Rating": 4.2,
            "PIN Code": "560001",
            "Product Address": "Bangalore, Karnataka",
            "GST Number": "29AABCJ5678B2Z6",
          },
        },
      ]);
      console.log("✅ Created profile for Jay Microsoft");
    } else {
      console.log("✅ Profile data found for Jay Microsoft");
    }

    // Now add test sell products for Jay Reliance
    console.log("\n📦 Adding test sell products for Jay Reliance...");
    const relianceProducts = [
      {
        productName: "Acetic Acid",
        productCategory: "Pharmaceutical",
        description: "High purity acetic acid for pharmaceutical use",
        minimumQuantity: "100",
        unit: "Kg"
      },
      {
        productName: "Sulfuric Acid",
        productCategory: "Industrial",
        description: "Concentrated sulfuric acid for industrial applications",
        minimumQuantity: "500",
        unit: "L"
      },
      {
        productName: "Sodium Hydroxide",
        productCategory: "Chemical",
        description: "Pure sodium hydroxide pellets",
        minimumQuantity: "200",
        unit: "Kg"
      }
    ];

    for (let i = 0; i < relianceProducts.length; i++) {
      const product = relianceProducts[i];
      const productId = `sell_product_reliance_${Date.now()}_${i}`;
      
      await index.namespace("chemicals").upsert([
        {
          id: productId,
          values: dummyVector,
          metadata: {
            "Product Name": product.productName,
            "Product Description": product.description,
            "Product Category": product.productCategory,
            "Product Price": 0,
            "Product Size": `${product.minimumQuantity} ${product.unit}`,
            "Product Unit": product.unit,
            "Minimum Order Quantity": parseInt(product.minimumQuantity),
            "Product Pictures": "https://via.placeholder.com/200x150/e5e7eb/9ca3af?text=Product+Image",
            "Product Rating": 0,
            "Seller Name": testCompany1,
            "Seller Email Address": testEmail,
            "Seller POC Contact Number": testPhone1,
            "Seller Address": "Mumbai, Maharashtra",
            "Region": "Maharashtra",
            "Seller Verified": true,
            "Seller Rating": 4.5,
            "PIN Code": "400001",
            "Product Address": "Mumbai, Maharashtra",
            "Product ID": productId,
            "Created At": new Date().toISOString(),
          },
        },
      ]);
      console.log(`  ✅ Added: ${product.productName}`);
    }

    // Now add test sell products for Jay Microsoft
    console.log("\n📦 Adding test sell products for Jay Microsoft...");
    const microsoftProducts = [
      {
        productName: "Nitric Acid",
        productCategory: "Laboratory",
        description: "Analytical grade nitric acid",
        minimumQuantity: "50",
        unit: "L"
      },
      {
        productName: "Phosphoric Acid",
        productCategory: "Food Grade",
        description: "Food grade phosphoric acid",
        minimumQuantity: "100",
        unit: "Kg"
      },
      {
        productName: "Citric Acid",
        productCategory: "Food Grade",
        description: "Anhydrous citric acid powder",
        minimumQuantity: "150",
        unit: "Kg"
      }
    ];

    for (let i = 0; i < microsoftProducts.length; i++) {
      const product = microsoftProducts[i];
      const productId = `sell_product_microsoft_${Date.now()}_${i}`;
      
      await index.namespace("chemicals").upsert([
        {
          id: productId,
          values: dummyVector,
          metadata: {
            "Product Name": product.productName,
            "Product Description": product.description,
            "Product Category": product.productCategory,
            "Product Price": 0,
            "Product Size": `${product.minimumQuantity} ${product.unit}`,
            "Product Unit": product.unit,
            "Minimum Order Quantity": parseInt(product.minimumQuantity),
            "Product Pictures": "https://via.placeholder.com/200x150/e5e7eb/9ca3af?text=Product+Image",
            "Product Rating": 0,
            "Seller Name": testCompany2,
            "Seller Email Address": testEmail,
            "Seller POC Contact Number": testPhone2,
            "Seller Address": "Bangalore, Karnataka",
            "Region": "Karnataka",
            "Seller Verified": true,
            "Seller Rating": 4.2,
            "PIN Code": "560001",
            "Product Address": "Bangalore, Karnataka",
            "Product ID": productId,
            "Created At": new Date().toISOString(),
          },
        },
      ]);
      console.log(`  ✅ Added: ${product.productName}`);
    }

    console.log("\n✅ Test sell products added successfully!");
    console.log("📊 Summary:");
    console.log(`  Jay Reliance: ${relianceProducts.length} products`);
    console.log(`  Jay Microsoft: ${microsoftProducts.length} products`);

  } catch (error) {
    console.error("❌ Error adding test sell products:", error);
  }
}

// Run the script
addTestSellProducts(); 