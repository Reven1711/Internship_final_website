const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

async function printProductsData() {
  try {
    console.log("🚀 Fetching all data from products namespace in products-you-buy index...");
    
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
      topK: 10000, // Get all records
      includeMetadata: true,
    });

    const records = queryResponse.matches || [];
    console.log(`📋 Found ${records.length} records in products namespace\n`);

    if (records.length === 0) {
      console.log("✅ No records found. Database is empty!");
      return;
    }

    // Print detailed information for each record
    records.forEach((record, index) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📝 RECORD ${index + 1}/${records.length}`);
      console.log(`${'='.repeat(80)}`);
      
      console.log(`🆔 Record ID: ${record.id}`);
      console.log(`📧 Email: ${record.metadata.email || 'N/A'}`);
      console.log(`📞 Phone Number: ${record.metadata.phoneNumber || 'N/A'}`);
      console.log(`🏢 Company Name: ${record.metadata.companyName || 'N/A'}`);
      console.log(`📊 Product Count: ${record.metadata.productCount || 0}`);
      
      // Parse and display products
      let products = [];
      if (record.metadata.productList) {
        try {
          if (Array.isArray(record.metadata.productList)) {
            products = record.metadata.productList;
          } else if (typeof record.metadata.productList === "string") {
            products = JSON.parse(record.metadata.productList);
          }
        } catch (error) {
          console.log(`❌ Error parsing productList: ${error.message}`);
          products = [];
        }
      }
      
      console.log(`\n🛍️  Products (${products.length}):`);
      if (products.length > 0) {
        products.forEach((product, productIndex) => {
          console.log(`   ${productIndex + 1}. ${product}`);
        });
      } else {
        console.log("   No products found");
      }
      
      // Display all metadata fields for debugging
      console.log(`\n🔍 All Metadata Fields:`);
      Object.keys(record.metadata).forEach(key => {
        const value = record.metadata[key];
        if (key !== 'productList') { // Skip productList as it's already displayed above
          console.log(`   ${key}: ${value}`);
        }
      });
    });

    // Summary statistics
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 SUMMARY STATISTICS`);
    console.log(`${'='.repeat(80)}`);
    
    const totalProducts = records.reduce((sum, record) => {
      return sum + (record.metadata.productCount || 0);
    }, 0);
    
    const usersWithPhone = records.filter(record => record.metadata.phoneNumber).length;
    const usersWithCompany = records.filter(record => record.metadata.companyName).length;
    
    console.log(`👥 Total Records: ${records.length}`);
    console.log(`🛍️  Total Products: ${totalProducts}`);
    console.log(`📞 Records with Phone: ${usersWithPhone}`);
    console.log(`🏢 Records with Company: ${usersWithCompany}`);
    console.log(`📧 Records with Email: ${records.filter(record => record.metadata.email).length}`);
    
    // Average products per record
    const avgProducts = records.length > 0 ? (totalProducts / records.length).toFixed(2) : 0;
    console.log(`📊 Average Products per Record: ${avgProducts}`);

  } catch (error) {
    console.error("❌ Error fetching products data:", error);
    process.exit(1);
  }
}

// Run the script
printProductsData()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 