const fetch = require('node-fetch');

async function testFixedDeletion() {
  const baseUrl = "http://localhost:5000";
  
  const email = "jay.r1@ahduni.edu.in";
  const companyName = "Silicon Conmix Products";
  const phoneNumber = "9313301345";
  
  console.log("=== TESTING FIXED DELETION FUNCTIONALITY ===");
  console.log(`Email: ${email}`);
  console.log(`Company: "${companyName}"`);
  console.log(`Phone: ${phoneNumber}`);
  
  try {
    // First, get a product to delete using Pinecone directly
    const { Pinecone } = require("@pinecone-database/pinecone");
    const PINECONE_API_KEY = "pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD";
    const PINECONE_INDEX_NAME = "chemicals-new";
    
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
    const index = pinecone.index(PINECONE_INDEX_NAME);
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Find a product to delete
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
      console.log("❌ No products found to delete");
      return;
    }

    const productToDelete = queryResponse.matches[0];
    console.log(`\n🎯 Found product to delete:`);
    console.log(`Pinecone Record ID: ${productToDelete.id}`);
    console.log(`Product Name: ${productToDelete.metadata["Product Name"] || "N/A"}`);
    
    // Test the deletion API with the fixed logic
    console.log("\n=== TESTING FIXED DELETE API ===");
    const deleteRequestBody = {
      productId: productToDelete.id, // Use the Pinecone record ID
      email: email,
      phoneNumber: phoneNumber,
      companyName: companyName
    };
    
    console.log("Delete request body:", JSON.stringify(deleteRequestBody, null, 2));
    
    const deleteResponse = await fetch(`${baseUrl}/api/sell-products/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deleteRequestBody),
    });

    const deleteData = await deleteResponse.json();
    
    if (deleteResponse.ok) {
      console.log("✅ DELETE API Response successful");
      console.log("Response:", deleteData);
      
      // Verify the product was actually deleted
      console.log("\n=== VERIFYING DELETION ===");
      const verifyResponse = await index.namespace("chemicals").query({
        vector: dummyVector,
        filter: {
          "Product ID": { $eq: productToDelete.id }
        },
        topK: 1,
        includeMetadata: true,
      });
      
      if (!verifyResponse.matches || verifyResponse.matches.length === 0) {
        console.log("✅ Product successfully deleted from Pinecone!");
      } else {
        console.log("❌ Product still exists in Pinecone after deletion");
      }
      
    } else {
      console.log("❌ DELETE API Error");
      console.log("Status:", deleteResponse.status);
      console.log("Response:", deleteData);
    }
    
  } catch (error) {
    console.error("❌ Error testing deletion:", error.message);
  }
}

if (require.main === module) {
  testFixedDeletion().catch(console.error);
} 