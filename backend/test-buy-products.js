const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function testBuyProducts() {
  try {
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("Testing products-you-buy index...");

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1536 dimensions (all zeros)
    const dummyVector = new Array(1536).fill(0);

    // Test 1: Query without namespace to see if there's any data
    console.log("\n=== Test 1: Query without namespace ===");
    try {
      const queryResponse1 = await index.query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log(
        "Query without namespace response:",
        JSON.stringify(queryResponse1, null, 2)
      );
    } catch (error) {
      console.log("Error querying without namespace:", error.message);
    }

    // Test 2: Query with products namespace (the correct one)
    console.log("\n=== Test 2: Query with products namespace ===");
    try {
      const queryResponse2 = await index.namespace("products").query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log(
        "Query with products namespace response:",
        JSON.stringify(queryResponse2, null, 2)
      );
    } catch (error) {
      console.log("Error querying with products namespace:", error.message);
    }

    // Test 3: Query with empty namespace
    console.log("\n=== Test 3: Query with empty namespace ===");
    try {
      const queryResponse3 = await index.namespace("").query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log(
        "Query with empty namespace response:",
        JSON.stringify(queryResponse3, null, 2)
      );
    } catch (error) {
      console.log("Error querying with empty namespace:", error.message);
    }

    // Test 4: Query with default namespace
    console.log("\n=== Test 4: Query with default namespace ===");
    try {
      const queryResponse4 = await index.namespace("default").query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log(
        "Query with default namespace response:",
        JSON.stringify(queryResponse4, null, 2)
      );
    } catch (error) {
      console.log("Error querying with default namespace:", error.message);
    }

    // Test 5: Specific email query in products namespace
    console.log("\n=== Test 5: Specific email query in products namespace ===");
    try {
      const queryResponse5 = await index.namespace("products").query({
        vector: dummyVector,
        filter: {
          email: { $eq: "jinilsavaj1711@gmail.com" },
        },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "Specific email query response:",
        JSON.stringify(queryResponse5, null, 2)
      );
    } catch (error) {
      console.log("Error with specific email query:", error.message);
    }

    // Test 6: List all namespaces (if possible)
    console.log("\n=== Test 6: Index statistics ===");
    try {
      const stats = await index.describeIndexStats();
      console.log("Index statistics:", JSON.stringify(stats, null, 2));
    } catch (error) {
      console.log("Error getting index statistics:", error.message);
    }
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testBuyProducts();
