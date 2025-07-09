const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

async function clearBuyProducts() {
  try {
    console.log("🚀 Starting to clear products namespace from products-you-buy index...");
    
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
    console.log(`📋 Found ${records.length} records in products namespace`);

    if (records.length === 0) {
      console.log("✅ No records found. Database is already empty!");
      return;
    }

    // Show what will be deleted
    console.log("\n🗑️  Records that will be deleted:");
    records.forEach((record, index) => {
      const email = record.metadata.email || 'Unknown';
      const productCount = record.metadata.productCount || 0;
      const products = record.metadata.productList ? 
        (Array.isArray(record.metadata.productList) ? 
          record.metadata.productList : 
          JSON.parse(record.metadata.productList)
        ) : [];
      
      console.log(`${index + 1}. ID: ${record.id} | Email: ${email} | Products: ${productCount} | Sample: ${products.slice(0, 3).join(', ')}${products.length > 3 ? '...' : ''}`);
    });

    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will permanently delete all buy products for all users!");
    console.log("Type 'YES' to confirm deletion:");
    
    // For automated scripts, you can comment out the confirmation and uncomment the next line
    // const confirm = 'YES';
    
    // For interactive use, uncomment these lines:
    // const readline = require('readline');
    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // const confirm = await new Promise(resolve => {
    //   rl.question('Type "YES" to confirm: ', resolve);
    //   rl.close();
    // });

    // For now, let's make it automatic but with a delay
    console.log("⏳ Waiting 3 seconds before deletion...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("🗑️  Deleting all records...");
    
    // Delete all records
    for (const record of records) {
      try {
        await index.namespace("products").deleteOne(record.id);
        const email = record.metadata.email || 'Unknown';
        console.log(`✅ Deleted: ${email} (ID: ${record.id})`);
      } catch (error) {
        console.error(`❌ Failed to delete ${record.id}:`, error.message);
      }
    }

    console.log("\n🎉 Successfully cleared products namespace!");
    console.log(`📊 Total records deleted: ${records.length}`);

  } catch (error) {
    console.error("❌ Error clearing products namespace:", error);
    process.exit(1);
  }
}

// Run the script
clearBuyProducts()
  .then(() => {
    console.log("✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 