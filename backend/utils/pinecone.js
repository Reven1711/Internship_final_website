const { Pinecone } = require("@pinecone-database/pinecone");

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

/**
 * Check if an email exists in the Pinecone database
 * @param {string} email - The email to check
 * @returns {Promise<Object>} - Result object with exists flag and data
 */
async function checkEmailExists(email) {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || "chemical-frontend";
    const index = pinecone.index(indexName);

    // Create a dummy vector with 1024 dimensions (all zeros)
    const dummyVector = new Array(1024).fill(0);

    // Query the index for the email in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    console.log(
      "Pinecone query response for email check:",
      JSON.stringify(queryResponse, null, 2)
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Email found in database
      const supplierData = queryResponse.matches[0].metadata;
      return {
        exists: true,
        message: "Email found in database",
        supplierData: {
          sellerName: supplierData["Seller Name"],
          sellerEmail: supplierData["Seller Email Address"],
          sellerVerified: supplierData["Seller Verified"],
          sellerRating: supplierData["Seller Rating"],
          region: supplierData["Region"],
          sellerAddress: supplierData["Seller Address"],
          sellerPOCContact: supplierData["Seller POC Contact Number"],
        },
      };
    } else {
      // Email not found in database
      return {
        exists: false,
        message:
          "Email is not registered, please register your business with WhatsApp",
      };
    }
  } catch (error) {
    console.error("Error checking email in Pinecone:", error);
    throw new Error(`Failed to check email in database: ${error.message}`);
  }
}

/**
 * Get all suppliers from the database
 * @returns {Promise<Array>} - Array of supplier data
 */
async function getAllSuppliers() {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || "chemical-frontend";
    const index = pinecone.index(indexName);

    // Create a dummy vector with 1024 dimensions (all zeros)
    const dummyVector = new Array(1024).fill(0);

    // Query all records in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      topK: 1000, // Adjust based on your needs
      includeMetadata: true,
    });

    return queryResponse.matches || [];
  } catch (error) {
    console.error("Error fetching suppliers from Pinecone:", error);
    throw new Error(`Failed to fetch suppliers: ${error.message}`);
  }
}

/**
 * Search suppliers by product category
 * @param {string} category - The product category to search for
 * @returns {Promise<Array>} - Array of matching suppliers
 */
async function searchSuppliersByCategory(category) {
  try {
    const indexName = process.env.PINECONE_INDEX_NAME || "chemical-frontend";
    const index = pinecone.index(indexName);

    // Create a dummy vector with 1024 dimensions (all zeros)
    const dummyVector = new Array(1024).fill(0);

    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Product Category": { $eq: category },
      },
      topK: 100,
      includeMetadata: true,
    });

    return queryResponse.matches || [];
  } catch (error) {
    console.error("Error searching suppliers by category:", error);
    throw new Error(`Failed to search suppliers: ${error.message}`);
  }
}

/**
 * Get all referral data from the 'referrals' namespace
 * @returns {Promise<Array>} - Array of referral data objects
 */
async function getAllReferrals() {
  try {
    // Always use chemicals-new for referrals
    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    const queryResponse = await index.namespace("referrals").query({
      vector: dummyVector,
      topK: 1000, // Adjust as needed
      includeMetadata: true,
    });
    return queryResponse.matches || [];
  } catch (error) {
    console.error("Error fetching referrals from Pinecone:", error);
    throw new Error(`Failed to fetch referrals: ${error.message}`);
  }
}

module.exports = {
  checkEmailExists,
  getAllSuppliers,
  searchSuppliersByCategory,
  getAllReferrals,
};
