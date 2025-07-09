const { Pinecone } = require("@pinecone-database/pinecone");
// Hardcoded Pinecone credentials for debugging
const PINECONE_API_KEY = "pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD";
const PINECONE_INDEX_NAME = "chemicals-new";

async function testDeletion() {
  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const dummyVector = new Array(1536).fill(0);
  dummyVector[0] = 1;

  // Test with the correct company name (single space)
  const correctCompanyName = "Silicon Conmix Products";
  
  console.log("=== TESTING DELETION FUNCTIONALITY ===");
  console.log(`Searching for products with company: "${correctCompanyName}"`);
  
  // First, find products for this company
  const queryResponse = await index.namespace("chemicals").query({
    vector: dummyVector,
    filter: {
      "Seller Name": { $eq: correctCompanyName }
    },
    topK: 10,
    includeMetadata: true,
  });

  const products = queryResponse.matches || [];
  
  if (products.length === 0) {
    console.log("❌ No products found for this company");
    return;
  }

  console.log(`✅ Found ${products.length} products for "${correctCompanyName}"`);
  
  // Display the first product details
  const firstProduct = products[0];
  console.log("\n=== FIRST PRODUCT DETAILS ===");
  console.log("Product ID:", firstProduct.id);
  console.log("Seller Email Address:", firstProduct.metadata["Seller Email Address"]);
  console.log("Seller Name:", firstProduct.metadata["Seller Name"]);
  console.log("Seller POC Contact Number:", firstProduct.metadata["Seller POC Contact Number"]);
  
  // Test the deletion filter logic
  console.log("\n=== TESTING DELETION FILTER ===");
  const deletionFilter = {
    "Product ID": { $eq: firstProduct.id },
    "Seller Email Address": { $eq: firstProduct.metadata["Seller Email Address"] },
    "Seller Name": { $eq: firstProduct.metadata["Seller Name"] },
    "Seller POC Contact Number": { $eq: firstProduct.metadata["Seller POC Contact Number"] }
  };
  
  console.log("Deletion filter:", JSON.stringify(deletionFilter, null, 2));
  
  // Test if the product can be found with the deletion filter
  const deletionTest = await index.namespace("chemicals").query({
    vector: dummyVector,
    filter: deletionFilter,
    topK: 1,
    includeMetadata: true,
  });
  
  if (deletionTest.matches && deletionTest.matches.length > 0) {
    console.log("✅ Product found with deletion filter - deletion should work!");
    console.log("Found product:", deletionTest.matches[0].id);
  } else {
    console.log("❌ Product NOT found with deletion filter - deletion will fail!");
  }
  
  // Test with wrong company name (double space)
  console.log("\n=== TESTING WITH WRONG COMPANY NAME ===");
  const wrongCompanyName = "Silicon  Conmix Products"; // double space
  const wrongFilter = {
    "Product ID": { $eq: firstProduct.id },
    "Seller Email Address": { $eq: firstProduct.metadata["Seller Email Address"] },
    "Seller Name": { $eq: wrongCompanyName },
    "Seller POC Contact Number": { $eq: firstProduct.metadata["Seller POC Contact Number"] }
  };
  
  const wrongTest = await index.namespace("chemicals").query({
    vector: dummyVector,
    filter: wrongFilter,
    topK: 1,
    includeMetadata: true,
  });
  
  if (wrongTest.matches && wrongTest.matches.length > 0) {
    console.log("❌ Product found with wrong company name - this shouldn't happen!");
  } else {
    console.log("✅ Product NOT found with wrong company name - this is correct!");
  }
}

if (require.main === module) {
  testDeletion().catch(console.error);
} 