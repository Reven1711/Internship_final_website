const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

async function migrateBuyProducts() {
  try {
    console.log("🔄 Starting buy products migration...");
    
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
    console.log(`📋 Found ${records.length} records to migrate\n`);

    if (records.length === 0) {
      console.log("✅ No records found. Nothing to migrate!");
      return;
    }

    // Process each record
    for (const record of records) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 Processing Record: ${record.id}`);
      
      const metadata = record.metadata;
      console.log(`📧 Email: ${metadata.email}`);
      console.log(`📞 Phone Number: ${metadata.phoneNumber || 'MISSING'}`);
      console.log(`🏢 Company Name: ${metadata.companyName || 'MISSING'}`);
      
      // Parse products
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
          continue;
        }
      }
      
      console.log(`🛍️  Products: ${products.length}`);
      
      // Check if this record has the required fields
      if (!metadata.phoneNumber || !metadata.companyName) {
        console.log(`⚠️  Record missing required fields - skipping`);
        continue;
      }
      
      // Create a new record ID with company-specific naming
      const newRecordId = `buy_products_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create new metadata with all required fields
      const newMetadata = {
        email: metadata.email,
        phoneNumber: metadata.phoneNumber,
        companyName: metadata.companyName,
        productList: JSON.stringify(products),
        productCount: products.length,
        id: newRecordId,
        migratedAt: new Date().toISOString(),
        originalId: record.id
      };
      
      console.log(`📝 Creating new record with ID: ${newRecordId}`);
      console.log(`🏢 Company: ${metadata.companyName}`);
      console.log(`📞 Phone: ${metadata.phoneNumber}`);
      
      // Create the new record
      await index.namespace("products").upsert([
        {
          id: newRecordId,
          values: dummyVector,
          metadata: newMetadata,
        },
      ]);
      
      console.log(`✅ New record created successfully`);
      
      // Delete the old record
      console.log(`🗑️  Deleting old record: ${record.id}`);
      await index.namespace("products").deleteOne(record.id);
      console.log(`✅ Old record deleted successfully`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Migration completed successfully!`);
    console.log(`📊 Processed ${records.length} records`);
    console.log(`\n💡 Now each company should have its own separate record`);

  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
migrateBuyProducts()
  .then(() => {
    console.log("\n✅ Migration script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  }); 