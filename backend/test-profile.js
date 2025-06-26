const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function testProfileData() {
  try {
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("Testing profile data in indexes...");

    // Test 1: Check chemicals-new index for profile data
    console.log("\n=== Test 1: chemicals-new index ===");
    try {
      const index1 = pinecone.index("chemicals-new");
      const dummyVector1 = new Array(1536).fill(0);
      dummyVector1[0] = 1;

      const queryResponse1 = await index1.namespace("chemicals").query({
        vector: dummyVector1,
        filter: {
          "Seller Email Address": { $eq: "jinilsavaj1711@gmail.com" },
        },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "chemicals-new query response:",
        JSON.stringify(queryResponse1, null, 2)
      );
    } catch (error) {
      console.log("Error querying chemicals-new:", error.message);
    }

    // Test 2: Check products-you-buy index for profile data
    console.log("\n=== Test 2: products-you-buy index ===");
    try {
      const index2 = pinecone.index("products-you-buy");
      const dummyVector2 = new Array(1024).fill(0);
      dummyVector2[0] = 1;

      const queryResponse2 = await index2.namespace("products").query({
        vector: dummyVector2,
        filter: {
          email: { $eq: "jinilsavaj1711@gmail.com" },
        },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "products-you-buy query response:",
        JSON.stringify(queryResponse2, null, 2)
      );
    } catch (error) {
      console.log("Error querying products-you-buy:", error.message);
    }

    // Test 3: Check if there's a separate profile index
    console.log("\n=== Test 3: Check for profile index ===");
    try {
      const index3 = pinecone.index("profiles");
      const dummyVector3 = new Array(1536).fill(0);
      dummyVector3[0] = 1;

      const queryResponse3 = await index3.query({
        vector: dummyVector3,
        filter: {
          email: { $eq: "jinilsavaj1711@gmail.com" },
        },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "profiles index query response:",
        JSON.stringify(queryResponse3, null, 2)
      );
    } catch (error) {
      console.log("Error querying profiles index:", error.message);
    }
  } catch (error) {
    console.error("Error in test:", error);
  }
}

testProfileData();
