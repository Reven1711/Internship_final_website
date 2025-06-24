const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function testProductRequests() {
  try {
    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log("Testing product request endpoints...");

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Test 1: Check if approved_chemicals namespace exists and has data
    console.log("\n=== Test 1: Check approved_chemicals namespace ===");
    try {
      const approvedChemicalsResponse = await index.namespace("approved_chemicals").query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log("Approved chemicals found:", approvedChemicalsResponse.matches?.length || 0);
      if (approvedChemicalsResponse.matches && approvedChemicalsResponse.matches.length > 0) {
        console.log("Sample approved chemical:", approvedChemicalsResponse.matches[0].metadata["Product Name"]);
      }
    } catch (error) {
      console.log("Error querying approved_chemicals namespace:", error.message);
    }

    // Test 2: Check if product-requests namespace exists
    console.log("\n=== Test 2: Check product-requests namespace ===");
    try {
      const productRequestsResponse = await index.namespace("product-requests").query({
        vector: dummyVector,
        topK: 5,
        includeMetadata: true,
      });
      console.log("Product requests found:", productRequestsResponse.matches?.length || 0);
      if (productRequestsResponse.matches && productRequestsResponse.matches.length > 0) {
        console.log("Sample product request:", {
          requestId: productRequestsResponse.matches[0].metadata.requestId,
          productName: productRequestsResponse.matches[0].metadata.productName,
          status: productRequestsResponse.matches[0].metadata.status
        });
      }
    } catch (error) {
      console.log("Error querying product-requests namespace:", error.message);
    }

    // Test 3: Test the API endpoints using fetch
    console.log("\n=== Test 3: Test API endpoints ===");
    
    // Test approved chemicals endpoint
    try {
      const response = await fetch('http://localhost:5000/api/approved-chemicals');
      if (response.ok) {
        const data = await response.json();
        console.log("Approved chemicals API response:", {
          success: data.success,
          count: data.count,
          sampleChemicals: data.chemicals?.slice(0, 3) || []
        });
      } else {
        console.log("Approved chemicals API failed:", response.status);
      }
    } catch (error) {
      console.log("Error calling approved chemicals API:", error.message);
    }

    // Test pending requests endpoint (admin only)
    try {
      const response = await fetch('http://localhost:5000/api/product-requests/pending?adminEmail=meet.r@ahduni.edu.in');
      if (response.ok) {
        const data = await response.json();
        console.log("Pending requests API response (meet.r):", {
          success: data.success,
          count: data.count
        });
      } else {
        const errorData = await response.json();
        console.log("Pending requests API failed (meet.r):", errorData.error);
      }
    } catch (error) {
      console.log("Error calling pending requests API (meet.r):", error.message);
    }

    // Test pending requests endpoint with second admin
    try {
      const response = await fetch('http://localhost:5000/api/product-requests/pending?adminEmail=jay.r1@ahduni.edu.in');
      if (response.ok) {
        const data = await response.json();
        console.log("Pending requests API response (jay.r1):", {
          success: data.success,
          count: data.count
        });
      } else {
        const errorData = await response.json();
        console.log("Pending requests API failed (jay.r1):", errorData.error);
      }
    } catch (error) {
      console.log("Error calling pending requests API (jay.r1):", error.message);
    }

    console.log("\n=== Test completed ===");

  } catch (error) {
    console.error("Error in test:", error);
  }
}

testProductRequests(); 