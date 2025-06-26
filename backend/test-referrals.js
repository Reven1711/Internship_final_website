const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function printReferrals() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const indexName = process.env.PINECONE_INDEX_NAME || "chemical-frontend";
    const index = pinecone.index(indexName);
    const dummyVector = new Array(1024).fill(0);
    const queryResponse = await index.namespace("referrals").query({
      vector: dummyVector,
      topK: 1000,
      includeMetadata: true,
    });
    const records = queryResponse.matches || [];
    console.log(`Found ${records.length} records in referrals namespace.`);
    records.forEach((rec, i) => {
      console.log(`\n--- Referral #${i + 1} ---`);
      console.log("ID:", rec.id);
      console.log("Metadata:", JSON.stringify(rec.metadata, null, 2));
    });
    if (records.length === 0) {
      console.log("No referral data found.");
    }
  } catch (error) {
    console.error("Error printing referrals:", error);
  }
}

printReferrals(); 