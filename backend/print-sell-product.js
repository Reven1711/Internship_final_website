const { Pinecone } = require("@pinecone-database/pinecone");
// Hardcoded Pinecone credentials for debugging
const PINECONE_API_KEY = "pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD";
const PINECONE_INDEX_NAME = "chemicals-new";

async function printAllSellerNames() {
  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const dummyVector = new Array(1536).fill(0);
  dummyVector[0] = 1;

  const queryResponse = await index.namespace("chemicals").query({
    vector: dummyVector,
    topK: 1000,
    includeMetadata: true,
  });

  const products = queryResponse.matches || [];
  if (products.length === 0) {
    console.log("No products found in the 'chemicals' namespace.");
    return;
  }

  // Extract all unique seller names
  const sellerNames = [...new Set(products.map(prod => prod.metadata["Seller Name"]))].sort();
  
  console.log("=== ALL UNIQUE SELLER NAMES IN PINECONE ===");
  sellerNames.forEach((name, i) => {
    console.log(`${i + 1}. "${name}"`);
  });
  
  console.log(`\nTotal unique sellers: ${sellerNames.length}`);
  console.log(`Total products: ${products.length}`);
}

if (require.main === module) {
  printAllSellerNames().catch(console.error);
} 