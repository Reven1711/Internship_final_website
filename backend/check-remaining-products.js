const { Pinecone } = require("@pinecone-database/pinecone");

async function checkRemainingProducts() {
  const PINECONE_API_KEY = "pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD";
  const PINECONE_INDEX_NAME = "chemicals-new";
  
  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const dummyVector = new Array(1536).fill(0);
  dummyVector[0] = 1;

  const email = "jay.r1@ahduni.edu.in";
  const companyName = "SRINIVAS STONE CRUSHER";
  const phoneNumber = "9313301345";
  
  console.log("=== CHECKING REMAINING PRODUCTS ===");
  console.log(`Email: ${email}`);
  console.log(`Company: \"${companyName}\"`);
  console.log(`Phone: ${phoneNumber}`);
  
  try {
    // Find all products for this company
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Name": { $eq: companyName },
        "Seller Email Address": { $eq: email },
        "Seller POC Contact Number": { $eq: phoneNumber }
      },
      topK: 10,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log("✅ No products found - all products have been successfully deleted!");
      return;
    }

    console.log(`\n📦 Found ${queryResponse.matches.length} remaining products:`);
    
    queryResponse.matches.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log(`Pinecone Record ID: ${product.id}`);
      console.log(`Product Name: ${product.metadata["Product Name"] || "N/A"}`);
      console.log(`Product ID in metadata: ${product.metadata["Product ID"] || "N/A"}`);
      console.log(`Seller Name: ${product.metadata["Seller Name"]}`);
      console.log(`Seller Email: ${product.metadata["Seller Email Address"]}`);
      console.log(`Seller Phone: ${product.metadata["Seller POC Contact Number"]}`);
    });
    
  } catch (error) {
    console.error("❌ Error checking remaining products:", error.message);
  }
}

if (require.main === module) {
  checkRemainingProducts().catch(console.error);
} 