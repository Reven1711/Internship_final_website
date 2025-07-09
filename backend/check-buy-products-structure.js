const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

async function checkBuyProductsStructure() {
  try {
    console.log("🔍 Checking buy products data structure...");
    
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Get the products-you-buy index
    const index = pinecone.index("products-you-buy");
    
    // Create a dummy vector for querying (1024 dimensions for products-you-buy index)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    console.log("📊 Fetching all records from products namespace...");
    
    // Get all records from products namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      topK: 1000, // Get all records
      includeMetadata: true,
    });

    const records = queryResponse.matches || [];
    console.log(`📋 Found ${records.length} records in products namespace\n`);

    if (records.length === 0) {
      console.log("✅ No records found. Database is empty!");
      return;
    }

    // Analyze the structure of each record
    console.log("📝 Analyzing record structure:");
    records.forEach((record, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 RECORD ${index + 1}/${records.length}`);
      console.log(`🆔 Record ID: ${record.id}`);
      
      const metadata = record.metadata;
      console.log(`📧 Email: ${metadata.email || 'MISSING'}`);
      console.log(`📞 Phone Number: ${metadata.phoneNumber || 'MISSING'}`);
      console.log(`🏢 Company Name: ${metadata.companyName || 'MISSING'}`);
      console.log(`📊 Product Count: ${metadata.productCount || 0}`);
      
      // Check if this record has the new fields
      const hasPhoneNumber = !!metadata.phoneNumber;
      const hasCompanyName = !!metadata.companyName;
      
      console.log(`✅ Has Phone Number: ${hasPhoneNumber}`);
      console.log(`✅ Has Company Name: ${hasCompanyName}`);
      
      if (!hasPhoneNumber || !hasCompanyName) {
        console.log(`⚠️  RECORD NEEDS MIGRATION - Missing required fields`);
      }
      
      // Show products
      let products = [];
      if (metadata.productList) {
        try {
          if (Array.isArray(metadata.productList)) {
            products = metadata.productList;
          } else if (typeof metadata.productList === "string") {
            products = JSON.parse(metadata.productList);
          }
        } catch (e) {
          console.log(`❌ Error parsing productList: ${e.message}`);
        }
      }
      
      console.log(`🛍️  Products (${products.length}):`);
      products.forEach((product, productIndex) => {
        console.log(`   ${productIndex + 1}. ${product}`);
      });
    });

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${'='.repeat(60)}`);
    
    const recordsWithPhone = records.filter(r => r.metadata.phoneNumber).length;
    const recordsWithCompany = records.filter(r => r.metadata.companyName).length;
    const recordsNeedingMigration = records.filter(r => !r.metadata.phoneNumber || !r.metadata.companyName).length;
    
    console.log(`📋 Total Records: ${records.length}`);
    console.log(`📞 Records with Phone Number: ${recordsWithPhone}`);
    console.log(`🏢 Records with Company Name: ${recordsWithCompany}`);
    console.log(`⚠️  Records Needing Migration: ${recordsNeedingMigration}`);
    
    if (recordsNeedingMigration > 0) {
      console.log(`\n💡 RECOMMENDATION: Run migration script to add missing fields`);
    } else {
      console.log(`\n✅ All records have the required fields!`);
    }

  } catch (error) {
    console.error("❌ Error checking buy products structure:", error);
    process.exit(1);
  }
}

// Run the script
checkBuyProductsStructure()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 