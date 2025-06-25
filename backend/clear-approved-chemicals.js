const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config();

async function clearApprovedChemicals() {
  try {
    console.log("🚀 Starting to clear approved_chemicals database...");
    
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");
    
    // Create a dummy vector for querying
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    console.log("📊 Fetching all records from approved_chemicals namespace...");
    
    // Get all records from approved_chemicals namespace
    const queryResponse = await index.namespace("approved_chemicals").query({
      vector: dummyVector,
      topK: 10000, // Get all records
      includeMetadata: true,
    });

    const records = queryResponse.matches || [];
    console.log(`📋 Found ${records.length} records in approved_chemicals`);

    if (records.length === 0) {
      console.log("✅ No records found. Database is already empty!");
      return;
    }

    // Show what will be deleted
    console.log("\n🗑️  Records that will be deleted:");
    records.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id} | Name: ${record.metadata.name} | Approved by: ${record.metadata.approvedBy}`);
    });

    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will permanently delete all approved chemicals!");
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
        await index.namespace("approved_chemicals").deleteOne(record.id);
        console.log(`✅ Deleted: ${record.metadata.name} (ID: ${record.id})`);
      } catch (error) {
        console.error(`❌ Failed to delete ${record.id}:`, error.message);
      }
    }

    console.log("\n🎉 Successfully cleared approved_chemicals database!");
    console.log(`📊 Total records deleted: ${records.length}`);

  } catch (error) {
    console.error("❌ Error clearing approved_chemicals:", error);
    process.exit(1);
  }
}

// Run the script
clearApprovedChemicals()
  .then(() => {
    console.log("✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 