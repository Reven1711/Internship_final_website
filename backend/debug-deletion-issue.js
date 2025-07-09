const { Pinecone } = require("@pinecone-database/pinecone");
const fetch = require('node-fetch');

async function debugDeletionIssue() {
  const PINECONE_API_KEY = "pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD";
  const PINECONE_INDEX_NAME = "chemicals-new";
  
  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const dummyVector = new Array(1536).fill(0);
  dummyVector[0] = 1;

  const email = "jay.r1@ahduni.edu.in";
  const companyName = "Silicon Conmix Products";
  const phoneNumber = "9313301345";
  
  console.log("=== DEBUGGING DELETION ISSUE ===");
  
  try {
    // Find the product
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Name": { $eq: companyName },
        "Seller Email Address": { $eq: email },
        "Seller POC Contact Number": { $eq: phoneNumber }
      },
      topK: 1,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log("❌ No products found");
      return;
    }

    const product = queryResponse.matches[0];
    console.log("🎯 Product found:");
    console.log(`Pinecone Record ID: ${product.id}`);
    console.log(`Product ID in metadata: ${product.metadata["Product ID"] || "N/A"}`);
    console.log(`Product Name: ${product.metadata["Product Name"] || "N/A"}`);
    
    // Check if Product ID matches Pinecone Record ID
    const productIdInMetadata = product.metadata["Product ID"];
    const pineconeRecordId = product.id;
    
    console.log(`\n=== ID COMPARISON ===`);
    console.log(`Pinecone Record ID: "${pineconeRecordId}"`);
    console.log(`Product ID in metadata: "${productIdInMetadata}"`);
    console.log(`IDs match: ${pineconeRecordId === productIdInMetadata}`);
    
    // Test deletion with Pinecone Record ID
    console.log(`\n=== TESTING DELETION WITH PINECONE RECORD ID ===`);
    try {
      await index.namespace("chemicals").deleteOne(pineconeRecordId);
      console.log("✅ Deletion with Pinecone Record ID completed");
      
      // Verify deletion
      const verifyResponse = await index.namespace("chemicals").query({
        vector: dummyVector,
        filter: {
          "Product ID": { $eq: productIdInMetadata }
        },
        topK: 1,
        includeMetadata: true,
      });
      
      if (!verifyResponse.matches || verifyResponse.matches.length === 0) {
        console.log("✅ Product successfully deleted!");
      } else {
        console.log("❌ Product still exists after deletion");
      }
      
    } catch (deleteError) {
      console.log("❌ Error deleting with Pinecone Record ID:", deleteError.message);
    }
    
    // Test deletion with Product ID from metadata
    if (productIdInMetadata && productIdInMetadata !== pineconeRecordId) {
      console.log(`\n=== TESTING DELETION WITH PRODUCT ID FROM METADATA ===`);
      try {
        await index.namespace("chemicals").deleteOne(productIdInMetadata);
        console.log("✅ Deletion with Product ID from metadata completed");
      } catch (deleteError) {
        console.log("❌ Error deleting with Product ID from metadata:", deleteError.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Error debugging deletion:", error.message);
  }
}

if (require.main === module) {
  debugDeletionIssue().catch(console.error);
} 