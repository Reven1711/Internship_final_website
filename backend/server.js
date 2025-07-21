const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();
const OpenAI = require("openai");
const { getAllReferrals } = require("./utils/pinecone");

const app = express();

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:6006",
      "http://localhost:8080",
      "http://localhost:8081", // Added for Vite dev server fallback
      "https://sourceasy.ai",
      "https://www.sourceasy.ai"
    ],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  });
});

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email configuration
transporter.verify(function (error, success) {
  // Email configuration verified
});

// Check if email exists in Pinecone database
app.post("/api/check-email", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the chemicals-new index (for both suppliers and buyers)
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // First, check if email exists in supplier database (chemicals namespace)
    const supplierQueryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    if (supplierQueryResponse.matches && supplierQueryResponse.matches.length > 0) {
      // Email found in supplier database - existing supplier
      const supplierData = supplierQueryResponse.matches[0].metadata;
      res.status(200).json({
        exists: true,
        isSupplier: true,
        userType: 'supplier',
        message: "Email found in supplier database",
        supplierData: {
          sellerName: supplierData["Seller Name"],
          sellerEmail: supplierData["Seller Email Address"],
          sellerVerified: supplierData["Seller Verified"],
          sellerRating: supplierData["Seller Rating"],
          region: supplierData["Region"],
          sellerAddress: supplierData["Seller Address"],
          sellerPOCContact: supplierData["Seller POC Contact Number"],
        },
      });
      return;
    }

    // If not in supplier database, check buyer database (buyers namespace)
    const buyerQueryResponse = await index.namespace("buyers").query({
      vector: dummyVector,
      filter: {
        "Buyer Email": { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    if (buyerQueryResponse.matches && buyerQueryResponse.matches.length > 0) {
      // Email found in buyer database - existing buyer
      const buyerData = buyerQueryResponse.matches[0].metadata;
      res.status(200).json({
        exists: true,
        isSupplier: false,
        userType: 'buyer',
        message: "Email found in buyer database",
        buyerData: {
          buyerName: buyerData["Buyer Name"],
          buyerEmail: buyerData["Buyer Email"],
          buyerPhone: buyerData["Buyer Phone"],
          buyerVerified: buyerData["Buyer Verified"] || false,
          region: buyerData["Region"] || "Unknown",
          createdAt: buyerData["Created At"],
        },
      });
      return;
    }

    // Email not found in either database - require phone number for new buyer registration
      if (!phoneNumber) {
        return res.status(200).json({
          exists: false,
          requiresPhone: true,
        message: "Phone number required to continue as buyer",
        });
      }

    // Phone number provided, allow registration as new buyer
      res.status(200).json({
        exists: false,
        isSupplier: false,
      userType: 'buyer',
        requiresPhone: false,
      message: "Phone number provided, proceeding as new buyer",
      });
  } catch (error) {
    console.error("Error checking email in Pinecone:", error);
    res.status(500).json({
      error: "Failed to check email in database",
      details: error.message,
    });
  }
});

// Add user as buyer to buyer database
app.post("/api/add-buyer", async (req, res) => {
  try {
    const { email, phoneNumber, displayName } = req.body;

    if (!email || !phoneNumber) {
      return res.status(400).json({ error: "Email and phone number are required" });
    }

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Create buyer record
    const buyerId = `buyer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const buyerData = {
      "Buyer Name": displayName || "Buyer",
      "Buyer Email": email,
      "Buyer Phone": phoneNumber,
      "Buyer Verified": false,
      "Region": "Unknown",
      "Created At": new Date().toISOString(),
      "User Type": "buyer",
    };

    // Upsert the buyer record to buyers namespace in chemicals-new index
    await index.namespace("buyers").upsert([{
      id: buyerId,
      values: dummyVector,
      metadata: buyerData
    }]);

    console.log(`✅ Added buyer to buyers namespace: ${email} with phone: ${phoneNumber}`);

    res.status(200).json({
      success: true,
      message: "Buyer added successfully",
      buyerData: {
        buyerId,
        email,
        phoneNumber,
        displayName: displayName || "Buyer",
        userType: "buyer"
      }
    });
  } catch (error) {
    console.error("Error adding buyer to database:", error);
    res.status(500).json({
      error: "Failed to add buyer to database",
      details: error.message,
    });
  }
});

// Validate GST number using Fact-Byte API
app.post("/api/validate-gst", async (req, res) => {
  try {
    const { gstin } = req.body;

    if (!gstin) {
      return res.status(400).json({ error: "GST number is required" });
    }

    // Validate GST format (15 characters, alphanumeric)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (gstin.length !== 15) {
      return res.status(400).json({ 
        error: "Invalid GST format", 
        message: "GST number must be exactly 15 characters" 
      });
    }
    if (!gstRegex.test(gstin)) {
      return res.status(400).json({ 
        error: "Invalid GST format", 
        message: "GST number must be in format: 22AAAAA0000A1Z5" 
      });
    }

    // Call Fact-Byte API
    const response = await fetch(`https://api.fact-byte.com/GST/GSTMasterInfo?gstin=${encodeURIComponent(gstin)}`, {
      method: 'GET',
      headers: {
        'clientId': 'e2f3c308-f891-4b59-9f1e-c78b7f71c4d5',
        'secreteKey': 'Bs9nDaNuyU9KJcyM4VXPnmM2-cjICkyaeIg9Ul6rFqU',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`Fact-Byte API error: ${response.status}. Using fallback validation.`);
      // Fallback: If API fails, accept the GST if format is valid
      const sellerDetails = {
        gstin: gstin,
        legal_name: 'Company Name (API Unavailable)',
        emailId: '',
        mobileNumber: '',
        primary_business_address: '',
        state_jurisdiction: '',
        current_registration_status: 'Active',
        business_constitution: '',
        aggregate_turn_over: '',
        register_date: '',
        register_cancellation_date: ''
      };
      res.status(200).json({
        success: true,
        valid: true,
        message: "GST format is valid (API validation unavailable)",
        sellerDetails
      });
      return;
    }

    const data = await response.json();
    console.log('Fact-Byte GST API response:', data);
    
    // Check if GST is valid based on API response
    if (data && data.success && data.data) {
      const gstData = data.data;
      // Extract relevant fields
      const sellerDetails = {
        gstin: gstData.gstin || '',
        legal_name: gstData.legal_name || '',
        emailId: gstData.emailId || '',
        mobileNumber: gstData.mobileNumber || '',
        primary_business_address: (gstData.primary_business_address && gstData.primary_business_address.registered_address) ? gstData.primary_business_address.registered_address : '',
        state_jurisdiction: gstData.state_jurisdiction || '',
        current_registration_status: gstData.current_registration_status || '',
        business_constitution: gstData.business_constitution || '',
        aggregate_turn_over: gstData.aggregate_turn_over || '',
        register_date: gstData.register_date || '',
        register_cancellation_date: gstData.register_cancellation_date || ''
      };
      res.status(200).json({
        success: true,
        valid: true,
        message: "GST number is valid",
        sellerDetails
      });
    } else {
      res.status(200).json({
        success: true,
        valid: false,
        message: "GST number is invalid or not found",
        sellerDetails: null
      });
    }
  } catch (error) {
    console.error("Error validating GST:", error);
    res.status(500).json({
      error: "Failed to validate GST",
      details: error.message,
    });
  }
});

// Get all suppliers/products for a specific email
app.post("/api/suppliers/email", async (req, res) => {
  try {
    const { email, companyName, companyContact } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the index with the correct namespace
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "chemicals-new"
    );

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Build filter based on provided parameters
    let filter = {
      "Seller Email Address": { $eq: email },
    };

    // Add company name filter if provided
    if (companyName) {
      filter["Seller Name"] = { $eq: companyName };
    }

    // Add company contact filter if provided
    if (companyContact) {
      filter["Seller POC Contact Number"] = { $eq: companyContact };
    }

    // Query the index for all records with the email in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter,
      topK: 100, // Get up to 100 products for this email
      includeMetadata: true,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Transform the data to match the frontend expectations
      const suppliers = queryResponse.matches.map((match) => {
        const metadata = match.metadata;
        return {
          productId: match.id, // Add the Product ID for edit/delete operations
          productName: metadata["Product Name"] || "Unknown Product",
          productDescription:
            metadata["Product Description"] || "No description available",
          productCategory: metadata["Product Category"] || "Uncategorized",
          productPrice: metadata["Product Price"] || 0,
          productSize: metadata["Product Size"] || "N/A",
          productUnit: metadata["Product Unit"] || "Kg",
          minimumOrderQuantity: metadata["Minimum Order Quantity"] || 0,
          productPictures: metadata["Product Pictures"] || "",
          productRating: metadata["Product Rating"] || 0,
          sellerName: metadata["Seller Name"] || "Unknown Seller",
          sellerEmail: metadata["Seller Email Address"] || email,
          sellerPOCContactNumber:
            metadata["Seller POC Contact Number"] || "N/A",
          sellerAddress: metadata["Seller Address"] || "N/A",
          region: metadata["Region"] || "Unknown Region",
          sellerVerified: metadata["Seller Verified"] || false,
          sellerRating: metadata["Seller Rating"] || 0,
          pinCode: metadata["PIN Code"] || "N/A",
          productAddress: metadata["Product Address"] || "N/A",
        };
      });

      res.status(200).json({
        success: true,
        suppliers: suppliers,
        count: suppliers.length,
      });
    } else {
      // No products found for this email
      res.status(200).json({
        success: true,
        suppliers: [],
        count: 0,
        message: "No products found for this email",
      });
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({
      error: "Failed to fetch suppliers",
      details: error.message,
    });
  }
});

// Get buy products for a specific email
app.get("/api/buy-products/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { phoneNumber, companyName } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`🔍 Fetching buy products for email: ${email}`);
    console.log(`📞 Phone number (optional): ${phoneNumber}`);
    console.log(`🏢 Company name (optional): ${companyName}`);

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Build filter using all three fields for proper company separation
    let filter = {
      email: { $eq: email },
    };

    // Add phone number filter if provided
    if (phoneNumber) {
      filter.phoneNumber = { $eq: phoneNumber };
    }

    // Add company name filter if provided
    if (companyName) {
      filter.companyName = { $eq: companyName };
    }

    console.log(`🔍 Using filter:`, filter);

    // Query the index for the email in the "products" namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const metadata = queryResponse.matches[0].metadata;
      
      // Support both array and string for productList
      let products = [];
      if (Array.isArray(metadata.productList)) {
        products = metadata.productList;
      } else if (typeof metadata.productList === "string") {
        try {
          products = JSON.parse(metadata.productList);
        } catch (e) {
          console.error("Error parsing productList:", e);
          products = [];
        }
      }
      
      console.log(`✅ Found ${products.length} buy products for email: ${email}`);
      
      res.status(200).json({
        success: true,
        products: products,
        count: products.length,
      });
    } else {
      // No products found for this email
      console.log(`❌ No buy products found for email: ${email}`);
      res.status(200).json({
        success: true,
        products: [],
        count: 0,
        message: "No products found for this email",
      });
    }
  } catch (error) {
    console.error("Error fetching buy products:", error);
    res.status(500).json({
      error: "Failed to fetch buy products",
      details: error.message,
    });
  }
});

// Helper to normalize product names
function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

// Add a product to user's buy list
app.post("/api/buy-products/add", async (req, res) => {
  try {
    const { email, productName, phoneNumber, companyName } = req.body;

    if (!email || !productName) {
      return res
        .status(400)
        .json({ error: "Email and product name are required" });
    }

    console.log(`🔍 Adding buy product: ${productName} for email: ${email}`);
    console.log(`📞 Phone number: ${phoneNumber}`);
    console.log(`🏢 Company name: ${companyName}`);

    // AI Moderation
    const prompt = `You are a content moderator for a chemical trading platform. Analyze the following product name and determine if it contains:

1. Abusive language, slurs, or offensive terms in ANY language (English, Hindi, Gujarati, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Urdu, etc.)
2. Irrelevant or nonsense words that are not real chemical names
3. Inappropriate content or profanity in any script or language

Examples of what to BLOCK:
- Slurs in Hindi/Gujarati (like "ghadedo", "harami", "chutiya", etc.)
- Random words that are not chemicals
- Abusive terms in any Indian language
- Nonsense or made-up words

Examples of what to ALLOW:
- Real chemical names (Acetic Acid, Sulfuric Acid, etc.)
- Chemical formulas (H2SO4, NaOH, etc.)
- Common chemical terms in any language

Product name to analyze: "${productName}"

Respond with ONLY "Yes" (if it should be BLOCKED) or "No" (if it should be ALLOWED).`;

    let aiApproved = false;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a strict content moderator for a chemical trading platform. You must detect abusive language, slurs, and inappropriate content in ALL languages including Hindi, Gujarati, and other Indian languages. Only respond with 'Yes' (block) or 'No' (allow).",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 3,
        temperature: 0,
      });
      const aiResponse = completion.choices[0].message.content
        .trim()
        .toLowerCase();
      aiApproved = aiResponse.startsWith("no");
      console.log(
        `AI Moderation for "${productName}": ${aiResponse} (Approved: ${aiApproved})`
      );
    } catch (error) {
      console.error("Error in OpenAI moderation:", error);
      return res
        .status(500)
        .json({ error: "AI moderation failed. Please try again later." });
    }

    if (!aiApproved) {
      return res
        .status(400)
        .json({ error: "Please enter a valid chemical or product." });
    }

    // Get the buy products index
    const index = pinecone.index("products-you-buy");
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Build filter to find existing record
    let filter = { email: { $eq: email } };
    
    // Add phone number filter if provided
    if (phoneNumber) {
      filter.phoneNumber = { $eq: phoneNumber };
    }
    
    // Add company name filter if provided
    if (companyName) {
      filter.companyName = { $eq: companyName };
    }

    // First, check if user already has a record in the "products" namespace
    console.log(`🔍 Querying for existing record with filter:`, filter);
    let queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });

    let existingProducts = [];
    let recordId = null;
    
    // If no record found with company filters, try without them
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log(`🔄 No record found with company filters, trying with email only`);
      const emailOnlyFilter = { email: { $eq: email } };
      queryResponse = await index.namespace("products").query({
        vector: dummyVector,
        filter: emailOnlyFilter,
        topK: 10, // Get more records to check for duplicates
        includeMetadata: true,
      });
      
      // Check if there are multiple records for this user
      if (queryResponse.matches && queryResponse.matches.length > 1) {
        console.log(`⚠️ Found ${queryResponse.matches.length} records for this user! This might cause overwrite issues.`);
        console.log(`📋 Record IDs:`, queryResponse.matches.map(m => m.id));
        
        // Use the first record but log a warning
        console.log(`⚠️ Using first record: ${queryResponse.matches[0].id}`);
      }
    }
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const metadata = queryResponse.matches[0].metadata;
      recordId = queryResponse.matches[0].id;
      console.log(`📋 Found existing record: ${recordId} with ${queryResponse.matches.length} matches`);
      console.log(`📦 Existing metadata:`, metadata);
      
      if (Array.isArray(metadata.productList)) {
        existingProducts = metadata.productList;
      } else if (typeof metadata.productList === "string") {
        existingProducts = JSON.parse(metadata.productList);
      } else {
        existingProducts = [];
      }
      console.log(`📊 Existing products: ${JSON.stringify(existingProducts)}`);
    } else {
      console.log(`🆕 No existing record found, will create new one`);
    }

    // Check if product already exists (case-insensitive, normalized)
    const normalizedNew = normalizeName(productName);
    const productExists = existingProducts.some((existingProduct) => {
      const normalizedExisting = normalizeName(existingProduct);
      return normalizedExisting === normalizedNew;
    });
    if (productExists) {
      return res
        .status(400)
        .json({ error: "Product already exists in your list" });
    }

    // Add new product
    existingProducts.push(productName);
    
    // Prepare metadata with all fields
    const metadata = {
      email: email,
      productList: JSON.stringify(existingProducts),
      productCount: existingProducts.length,
    };
    
    // Add optional fields if provided
    if (phoneNumber) {
      metadata.phoneNumber = phoneNumber;
    }
    if (companyName) {
      metadata.companyName = companyName;
    }
    
    if (recordId) {
      metadata.id = recordId;
      console.log(`🔄 Updating existing record: ${recordId}`);
      console.log(`📝 New metadata:`, metadata);
      // Use upsert directly instead of delete-then-upsert to avoid race conditions
      await index.namespace("products").upsert([
        {
          id: recordId,
          values: dummyVector,
          metadata: metadata,
        },
      ]);
      console.log(`✅ Successfully updated existing record`);
    } else {
      // Generate a unique ID with timestamp and random string to avoid conflicts
      const newId = `buy_products_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      metadata.id = newId;
      console.log(`🆕 Creating new record: ${newId}`);
      console.log(`📝 New metadata:`, metadata);
      await index.namespace("products").upsert([
        {
          id: newId,
          values: dummyVector,
          metadata: metadata,
        },
      ]);
      console.log(`✅ Successfully created new record`);
    }

    // Add to unapproved_chemicals for admin review
    const chemicalsIndex = pinecone.index("chemicals-new");
    const chemicalsDummyVector = new Array(1536).fill(0);
    chemicalsDummyVector[0] = 1;
    const unapprovedId = `unapproved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const unapprovedMetadata = {
      name: productName,
      email: email,
      submittedAt: new Date().toISOString(),
      status: "pending",
      aiVerified: true,
    };
    
    // Add optional fields to unapproved chemicals
    if (phoneNumber) {
      unapprovedMetadata.phoneNumber = phoneNumber;
    }
    if (companyName) {
      unapprovedMetadata.companyName = companyName;
    }
    
    await chemicalsIndex.namespace("unapproved_chemicals").upsert([
      {
        id: unapprovedId,
        values: chemicalsDummyVector,
        metadata: unapprovedMetadata,
      },
    ]);

    console.log(`✅ Successfully added product: ${productName} for email: ${email}`);
    console.log(`📊 Final product count: ${existingProducts.length}`);
    console.log(`📋 All products: ${JSON.stringify(existingProducts)}`);

    res.status(200).json({
      success: true,
      message: "Product added and submitted for admin approval.",
      products: existingProducts,
      count: existingProducts.length,
    });
  } catch (error) {
    console.error("Error adding buy product:", error);
    res.status(500).json({
      error: "Failed to add product",
      details: error.message,
    });
  }
});

// Remove a product from user's buy list
app.delete("/api/buy-products/remove", async (req, res) => {
  try {
    const { email, productName, phoneNumber, companyName } = req.body;

    if (!email || !productName) {
      return res
        .status(400)
        .json({ error: "Email and product name are required" });
    }

    console.log(`🔍 Removing buy product: ${productName} for email: ${email}`);
    console.log(`📞 Phone number: ${phoneNumber}`);
    console.log(`🏢 Company name: ${companyName}`);

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Build filter to find existing record
    let filter = { email: { $eq: email } };
    
    // Add phone number filter if provided
    if (phoneNumber) {
      filter.phoneNumber = { $eq: phoneNumber };
    }
    
    // Add company name filter if provided
    if (companyName) {
      filter.companyName = { $eq: companyName };
    }

    console.log(`🔍 Filter being used:`, JSON.stringify(filter));

    // Find user's record in the "products" namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log(`❌ No records found with filter:`, JSON.stringify(filter));
      return res.status(404).json({
        error: "No products found for this email",
      });
    }

    console.log(`✅ Found ${queryResponse.matches.length} record(s) for user`);

    const metadata = queryResponse.matches[0].metadata;
    console.log(`📋 Record metadata:`, JSON.stringify(metadata, null, 2));
    
    let existingProducts = [];
    // Support both array and string for productList
    if (Array.isArray(metadata.productList)) {
      existingProducts = metadata.productList;
    } else if (typeof metadata.productList === "string") {
      existingProducts = JSON.parse(metadata.productList);
    } else {
      existingProducts = [];
    }
    
    console.log(`📦 Existing products in record:`, JSON.stringify(existingProducts));
    console.log(`🎯 Looking for product: "${productName}"`);
    
    const recordId = queryResponse.matches[0].id;

    // Remove the product (case-insensitive and trim whitespace)
    const normalizedProductName = productName.trim().toLowerCase();
    const updatedProducts = existingProducts.filter(
      (product) => product.trim().toLowerCase() !== normalizedProductName
    );

    if (updatedProducts.length === existingProducts.length) {
      console.log(`❌ Product not found: "${productName}" in list: ${JSON.stringify(existingProducts)}`);
      return res.status(404).json({
        error: "Product not found in your list",
      });
    }

    // Prepare updated metadata with all fields
    const updatedMetadata = {
      email: email,
      productList: JSON.stringify(updatedProducts),
      productCount: updatedProducts.length,
    };
    
    // Add optional fields if they exist in the original record
    if (metadata.phoneNumber) {
      updatedMetadata.phoneNumber = metadata.phoneNumber;
    }
    if (metadata.companyName) {
      updatedMetadata.companyName = metadata.companyName;
    }
    if (metadata.id) {
      updatedMetadata.id = metadata.id;
    }

    // Use upsert directly instead of delete-then-upsert to avoid race conditions
    await index.namespace("products").upsert([
      {
        id: recordId,
        values: dummyVector,
        metadata: updatedMetadata,
      },
    ]);

    console.log(`✅ Successfully removed product: ${productName} for email: ${email}`);
    console.log(`📊 Final product count: ${updatedProducts.length}`);
    console.log(`📋 All products: ${JSON.stringify(updatedProducts)}`);

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
      products: updatedProducts,
      count: updatedProducts.length,
    });
  } catch (error) {
    console.error("Error removing buy product:", error);
    res.status(500).json({
      error: "Failed to remove product",
      details: error.message,
    });
  }
});

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  const { firstName, lastName, email, company, message, to } = req.body;

  if (!firstName || !lastName || !email || !company || !message || !to) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: `New Contact Form Submission from ${firstName} ${lastName}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  try {
    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing:", {
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS
      });
      return res.status(500).json({
        error: "Email service not configured",
        details: "Email credentials are missing"
      });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

// Get all companies for a specific email and phone number
app.get("/api/user-companies/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { phoneNumber } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Get all companies with the same email
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
      topK: 1000, // Get up to 1000 records to find all companies
      includeMetadata: true,
    });

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Extract unique companies based on Seller Name and Seller POC Contact Number
      const companiesMap = new Map();
      
      queryResponse.matches.forEach((match) => {
        const metadata = match.metadata;
        const sellerName = metadata["Seller Name"];
        const sellerContact = metadata["Seller POC Contact Number"];
        const gstNumber = metadata["GST Number"] || "N/A";
        const region = metadata["Region"] || "Unknown";
        const sellerAddress = metadata["Seller Address"] || "N/A";
        
        // Create a unique key for each company (name + contact)
        const companyKey = `${sellerName}_${sellerContact}`;
        
        if (!companiesMap.has(companyKey)) {
          companiesMap.set(companyKey, {
            id: companyKey,
            name: sellerName,
            gst: gstNumber,
            contact: sellerContact,
            region: region,
            address: sellerAddress,
            email: metadata["Seller Email Address"],
            verified: metadata["Seller Verified"] || false,
            rating: metadata["Seller Rating"] || 0
          });
        }
      });

      // Convert map to array
      let companies = Array.from(companiesMap.values());

      // If phone number is provided, filter to only companies with that phone number
      if (phoneNumber) {
        companies = companies.filter(company => company.contact === phoneNumber);
      }

      // Only log once per request, not for every company
      console.log(`Found ${companies.length} unique companies for email: ${email}`);

      res.status(200).json({
        success: true,
        companies: companies,
        count: companies.length,
      });
    } else {
      // No companies found for this email
      res.status(200).json({
        success: true,
        companies: [],
        count: 0,
        message: "No companies found for this email",
      });
    }
  } catch (error) {
    console.error("Error fetching user companies:", error);
    res.status(500).json({
      error: "Failed to fetch user companies",
      details: error.message,
    });
  }
});

// Get profile info for a specific email
app.get("/api/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { companyName, companyContact } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");
    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;
    
    // Build filter based on provided parameters
    let filter = {
      "Seller Email Address": { $eq: email },
    };

    // Add company name filter if provided
    if (companyName) {
      filter["Seller Name"] = { $eq: companyName };
    }

    // Add company contact filter if provided
    if (companyContact) {
      filter["Seller POC Contact Number"] = { $eq: companyContact };
    }
    
    // Query the index for the email in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const metadata = queryResponse.matches[0].metadata;
      res.status(200).json({
        success: true,
        profile: metadata,
      });
    } else {
      res.status(404).json({
        error: "No profile found for this email",
      });
    }
  } catch (error) {
    console.error
    ("Error fetching profile info:", error);
    res.status(500).json({
      error: "Failed to fetch profile info",
      details: error.message,
    });
  }
});

// Add sell products for a specific email
app.post("/api/sell-products/add", async (req, res) => {
  try {
    const { email, products, phoneNumber, companyName } = req.body;

    if (!email || !products || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Email and products array are required",
      });
    }

    if (products.length === 0) {
      return res.status(400).json({
        error: "At least one product is required",
      });
    }

    console.log(`🔍 Adding sell products for email: ${email}`);
    console.log(`📞 Phone number: ${phoneNumber}`);
    console.log(`🏢 Company name: ${companyName}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Build filter to find seller's profile data
    let filter = {
      "Seller Email Address": { $eq: email },
    };

    // Add company name filter if provided
    if (companyName) {
      filter["Seller Name"] = { $eq: companyName };
    }

    // Add phone number filter if provided
    if (phoneNumber) {
      filter["Seller POC Contact Number"] = { $eq: phoneNumber };
    }

    // First, get the seller's profile data to use for the new products
    const profileQueryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });

    if (
      !profileQueryResponse.matches ||
      profileQueryResponse.matches.length === 0
    ) {
      return res.status(404).json({
        error: "Seller profile not found. Please register your business first.",
      });
    }

    const profileData = profileQueryResponse.matches[0].metadata;


    // Check for existing products to avoid duplicates
    const existingProductsQuery = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
        "Product Name": { $in: products.map((p) => p.productName) },
        ...(companyName && { "Seller Name": { $eq: companyName } }),
        ...(phoneNumber && { "Seller POC Contact Number": { $eq: phoneNumber } }),
      },
      topK: 100,
      includeMetadata: true,
    });

    const existingProductNames =
      existingProductsQuery.matches?.map(
        (match) => match.metadata["Product Name"]
      ) || [];

    const duplicateProducts = products.filter((product) =>
      existingProductNames.includes(product.productName)
    );

    if (duplicateProducts.length > 0) {
      return res.status(400).json({
        error: "Some products already exist",
        duplicates: duplicateProducts.map((p) => p.productName),
      });
    }

    // Prepare products for insertion
    const productsToInsert = products.map((product, index) => {
      const productId = `sell_product_${Date.now()}_${index}`;
      const unit = product.unit === "Other" ? product.customUnit : product.unit;

      return {
        id: productId,
        values: dummyVector,
        metadata: {
          "Product Name": product.productName,
          "Product Description":
            product.description || "No description available",
          "Product Category": product.productCategory,
          "Product Price": 0, // Default price
          "Product Size": `${product.minimumQuantity} ${unit}`,
          "Product Unit": unit,
          "Minimum Order Quantity": parseInt(product.minimumQuantity) || 1,
          "Product Pictures":
            "https://via.placeholder.com/200x150/e5e7eb/9ca3af?text=Product+Image",
          "Product Rating": 0,
          "Seller Name": profileData["Seller Name"] || "Unknown Seller",
          "Seller Email Address": email,
          "Seller POC Contact Number":
            profileData["Seller POC Contact Number"] || "N/A",
          "Seller Address": profileData["Seller Address"] || "N/A",
          Region: profileData["Region"] || "Unknown Region",
          "Seller Verified": profileData["Seller Verified"] || false,
          "Seller Rating": profileData["Seller Rating"] || 0,
          "PIN Code": profileData["PIN Code"] || "N/A",
          "Product Address": profileData["Product Address"] || "N/A",
          "Product ID": productId,
          "Created At": new Date().toISOString(),
        },
      };
    });

    console.log(
      "Inserting products:",
      productsToInsert.map((p) => p.metadata["Product Name"])
    );

    // Insert all products
    await index.namespace("chemicals").upsert(productsToInsert);

    // Remove user from buyer database when they register as supplier
    try {
      console.log(`🔄 Removing user from buyer database: ${email}`);
      
      // Query to find buyer records for this email
      const buyerQueryResponse = await index.namespace("buyers").query({
        vector: dummyVector,
        filter: {
          "Buyer Email": { $eq: email },
          ...(phoneNumber && { "Buyer Phone": { $eq: phoneNumber } }),
          ...(companyName && { "Buyer Name": { $eq: companyName } }),
        },
        topK: 100,
        includeMetadata: true,
      });

      if (buyerQueryResponse.matches && buyerQueryResponse.matches.length > 0) {
        // Delete all buyer records for this user
        const buyerIdsToDelete = buyerQueryResponse.matches.map(match => match.id);
        console.log(`🗑️ Deleting ${buyerIdsToDelete.length} buyer records:`, buyerIdsToDelete);
        
        // Delete the buyer records
        await index.namespace("buyers").deleteMany(buyerIdsToDelete);
        
        console.log(`✅ Successfully removed user from buyer database`);
      } else {
        console.log(`ℹ️ No buyer records found for email: ${email}`);
      }
    } catch (error) {
      console.error("⚠️ Error removing user from buyer database:", error);
      // Don't fail the entire operation if buyer removal fails
    }

    res.status(200).json({
      success: true,
      message: "Products added successfully and user converted to supplier",
      addedProducts: products.map((p) => p.productName),
      count: products.length,
      userConverted: true
    });
  } catch (error) {
    console.error("Error adding sell products:", error);
    res.status(500).json({
      error: "Failed to add products",
      details: error.message,
    });
  }
});

// Helper function to extract PIN code from address
function extractPincode(address) {
  if (!address) return null;
  
  // Look for 6-digit PIN code pattern
  const pincodeMatch = address.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    return pincodeMatch[0];
  }
  
  return null;
}

// Convert buyer to supplier by adding sample product
app.post("/api/convert-to-supplier", async (req, res) => {
  try {
    const { email, phoneNumber, companyName, gstNumber, sellerDetails } = req.body;

    if (!email || !phoneNumber || !companyName || !gstNumber) {
      return res.status(400).json({
        error: "Email, phone number, company name, and GST number are required",
      });
    }

    console.log(`🔄 Converting buyer to supplier: ${email}`);
    console.log(`📞 Phone: ${phoneNumber}`);
    console.log(`🏢 Company: ${companyName}`);
    console.log(`🏷️ GST: ${gstNumber}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Create sample product for the supplier with complete GST validation data
    const sampleProductId = `sample_product_${Date.now()}`;
    const sampleProduct = {
      id: sampleProductId,
      values: dummyVector,
      metadata: {
        // Product Information
        "Product Name": "Sample Product",
        "Product Description": "You can add products using the Add Product btn above",
        "Product Category": "General",
        "Product Price": 0,
        "Product Size": "1 Kg",
        "Product Unit": "Kg",
        "Minimum Order Quantity": 1,
        "Product Pictures": "https://via.placeholder.com/200x150/e5e7eb/9ca3af?text=Sample+Product",
        "Product Rating": 0,
        "Product ID": sampleProductId,
        "Product Address": sellerDetails?.primary_business_address || "Address not provided",
        
        // Seller Information (from GST validation + user input)
        "Seller Name": sellerDetails?.legal_name || companyName,
        "Seller Email Address": email, // User-edited email
        "Seller POC Contact Number": phoneNumber, // User-edited phone
        "Seller Address": sellerDetails?.primary_business_address || "Address not provided",
        "Seller Verified": true,
        "Seller Rating": 0,
        
        // GST and Location Information (from GST validation)
        "GST Number": gstNumber,
        "Region": sellerDetails?.state_jurisdiction || "Unknown Region",
        "PIN Code": extractPincode(sellerDetails?.primary_business_address) || "N/A",
        
        // Additional GST Data (complete business information)
        "Business Constitution": sellerDetails?.business_constitution || "N/A",
        "Registration Status": sellerDetails?.current_registration_status || "Active",
        "Registration Date": sellerDetails?.register_date || "N/A",
        "Aggregate Turnover": sellerDetails?.aggregate_turn_over || "N/A",
        "State Jurisdiction": sellerDetails?.state_jurisdiction || "N/A",
        "GSTIN": gstNumber, // Alternative field name used by some records
        
        "Created At": new Date().toISOString(),
      },
    };

    // Add sample product to supplier database
    console.log("📦 Adding sample product to supplier database");
    await index.namespace("chemicals").upsert([sampleProduct]);

    // Remove user from buyer database
    try {
      console.log(`🗑️ Removing user from buyer database: ${email}`);
      
      // Query to find buyer records for this email
      const buyerQueryResponse = await index.namespace("buyers").query({
        vector: dummyVector,
        filter: {
          "Buyer Email": { $eq: email },
          "Buyer Phone": { $eq: phoneNumber },
        },
        topK: 100,
        includeMetadata: true,
      });

      if (buyerQueryResponse.matches && buyerQueryResponse.matches.length > 0) {
        // Delete all buyer records for this user
        const buyerIdsToDelete = buyerQueryResponse.matches.map(match => match.id);
        console.log(`🗑️ Deleting ${buyerIdsToDelete.length} buyer records:`, buyerIdsToDelete);
        
        // Delete the buyer records
        await index.namespace("buyers").deleteMany(buyerIdsToDelete);
        
        console.log(`✅ Successfully removed user from buyer database`);
      } else {
        console.log(`ℹ️ No buyer records found for email: ${email}`);
      }
    } catch (error) {
      console.error("⚠️ Error removing user from buyer database:", error);
      // Don't fail the entire operation if buyer removal fails
    }

    res.status(200).json({
      success: true,
      message: "Successfully converted to supplier",
      sampleProductAdded: true,
      buyerRemoved: true,
    });
  } catch (error) {
    console.error("Error converting to supplier:", error);
    res.status(500).json({
      error: "Failed to convert to supplier",
      details: error.message,
    });
  }
});

// Update a sell product
app.put("/api/sell-products/update", async (req, res) => {
  try {
    const { productId, updatedData, email, phoneNumber, companyName } = req.body;

    if (!productId || !updatedData) {
      return res.status(400).json({
        error: "Product ID and updated data are required",
      });
    }

    console.log(`🔍 Updating sell product: ${productId} for email: ${email}`);
    console.log(`📞 Phone number: ${phoneNumber}`);
    console.log(`🏢 Company name: ${companyName}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Build filter to find the specific product
    let filter = {
      "Product ID": { $eq: productId },
    };

    // Add additional filters if provided for extra security
    if (email) {
      filter["Seller Email Address"] = { $eq: email };
    }
    if (companyName) {
      filter["Seller Name"] = { $eq: companyName };
    }
    if (phoneNumber) {
      filter["Seller POC Contact Number"] = { $eq: phoneNumber };
    }

    // First, get the existing product to preserve seller information
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: filter,
      topK: 1,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const existingProduct = queryResponse.matches[0];
    const existingMetadata = existingProduct.metadata;

    // Update the metadata with new values while preserving seller info
    const updatedMetadata = {
      ...existingMetadata,
      "Product Name":
        updatedData.productName || existingMetadata["Product Name"],
      "Product Description":
        updatedData.productDescription ||
        existingMetadata["Product Description"],
      "Product Category":
        updatedData.productCategory || existingMetadata["Product Category"],
      "Product Size": `${
        updatedData.minimumOrderQuantity ||
        existingMetadata["Minimum Order Quantity"]
      } ${updatedData.productUnit || existingMetadata["Product Unit"]}`,
      "Product Unit":
        updatedData.productUnit || existingMetadata["Product Unit"],
      "Minimum Order Quantity":
        parseInt(updatedData.minimumOrderQuantity) ||
        existingMetadata["Minimum Order Quantity"],
      "Updated At": new Date().toISOString(),
    };

    // Delete the existing record and create updated one
    await index.namespace("chemicals").deleteOne(productId);

    await index.namespace("chemicals").upsert([
      {
        id: productId,
        values: dummyVector,
        metadata: updatedMetadata,
      },
    ]);



    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      productId: productId,
    });
  } catch (error) {
    console.error("Error updating sell product:", error);
    res.status(500).json({
      error: "Failed to update product",
      details: error.message,
    });
  }
});

// Delete a sell product
app.delete("/api/sell-products/delete", async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: "Product ID is required",
      });
    }

    // Delete the product directly by Pinecone record ID
    await pinecone.index("chemicals-new").namespace("chemicals").deleteOne(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      productId: productId,
    });
  } catch (error) {
    console.error("Error deleting sell product:", error);
    res.status(500).json({
      error: "Failed to delete product",
      details: error.message,
    });
  }
});

// ===== PRODUCT REQUEST AND ADMIN APPROVAL ENDPOINTS =====

// Submit a product request (for "Other Product")
app.post("/api/product-requests/submit", async (req, res) => {
  try {
    const { email, productName } = req.body;

    if (!email || !productName) {
      return res.status(400).json({
        error: "Email and product name are required",
      });
    }

    // Use the correct index and vector dimension
    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Generate unique request ID
    const requestId = `unapproved_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store the request in the unapproved_chemicals namespace
    await index.namespace("unapproved_chemicals").upsert([
      {
        id: requestId,
        values: dummyVector,
        metadata: {
          id: requestId,
          name: productName,
          email: email,
          status: "pending",
          submittedAt: new Date().toISOString(),
        },
      },
    ]);



    res.status(200).json({
      success: true,
      message:
        "Product request submitted successfully. It will be reviewed by our team.",
      requestId: requestId,
    });
  } catch (error) {
    console.error("Error submitting product request:", error);
    res.status(500).json({
      error: "Failed to submit product request",
      details: error.message,
    });
  }
});

// Get all pending unapproved chemicals (admin only)
app.get("/api/unapproved-chemicals/pending", async (req, res) => {
  try {
    const { adminEmail } = req.query;
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",")
      : [];
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }
    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;
    const queryResponse = await index.namespace("unapproved_chemicals").query({
      vector: dummyVector,
      filter: { status: { $eq: "pending" } },
      topK: 100,
      includeMetadata: true,
    });
    const pendingRequests =
      queryResponse.matches?.map((match) => ({
        id: match.id,
        name: match.metadata.name,
        email: match.metadata.email,
        status: match.metadata.status,
        submittedAt: match.metadata.submittedAt,
      })) || [];
    res.status(200).json({
      success: true,
      requests: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error("Error fetching unapproved chemicals:", error);
    res.status(500).json({
      error: "Failed to fetch unapproved chemicals",
      details: error.message,
    });
  }
});

// Approve an unapproved chemical (admin only)
app.post("/api/unapproved-chemicals/approve", async (req, res) => {
  try {
    const { adminEmail, id, name: correctedName } = req.body;


    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",")
      : [];
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }
    if (!id) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // First, get the record to extract data
    const queryResponse = await index.namespace("unapproved_chemicals").query({
      vector: dummyVector,
      filter: { id: { $eq: id } },
      topK: 1,
      includeMetadata: true,
    });



    let name, email;

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      // Try without filter - maybe the ID is the record ID itself
      const allResponse = await index.namespace("unapproved_chemicals").query({
        vector: dummyVector,
        topK: 1000,
        includeMetadata: true,
      });

      const foundRecord = allResponse.matches?.find((match) => match.id === id);
      if (!foundRecord) {
        return res.status(404).json({ error: "Unapproved chemical not found" });
      }

      name = foundRecord.metadata.name;
      email = foundRecord.metadata.email;

      const finalName = correctedName || name;
      // Add to approved_chemicals
      await index.namespace("approved_chemicals").upsert([
        {
          id: id,
          values: dummyVector,
          metadata: {
            id: id,
            name: finalName,
            approvedBy: adminEmail,
            approvedAt: new Date().toISOString(),
            requestedBy: email,
          },
        },
      ]);
      // Fetch and log the record to verify
      const verifyResponse = await index.namespace("approved_chemicals").query({
        vector: dummyVector,
        filter: { id: { $eq: id } },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "Verified approved_chemicals record:",
        JSON.stringify(verifyResponse, null, 2)
      );

      // Remove from unapproved_chemicals
      await index.namespace("unapproved_chemicals").deleteOne(id);
      console.log("Removed from unapproved_chemicals:", id);

      res.status(200).json({
        success: true,
        message: "Chemical approved and added to approved_chemicals.",
        id,
      });
    } else {
      const request = queryResponse.matches[0];
      name = request.metadata.name;
      email = request.metadata.email;
      console.log("Found unapproved chemical:", { name, email, id });

      const finalName = correctedName || name;
      // Add to approved_chemicals
      await index.namespace("approved_chemicals").upsert([
        {
          id: id,
          values: dummyVector,
          metadata: {
            id: id,
            name: finalName,
            approvedBy: adminEmail,
            approvedAt: new Date().toISOString(),
            requestedBy: email,
          },
        },
      ]);
      // Fetch and log the record to verify
      const verifyResponse = await index.namespace("approved_chemicals").query({
        vector: dummyVector,
        filter: { id: { $eq: id } },
        topK: 1,
        includeMetadata: true,
      });
      console.log(
        "Verified approved_chemicals record:",
        JSON.stringify(verifyResponse, null, 2)
      );

      // Remove from unapproved_chemicals
      await index.namespace("unapproved_chemicals").deleteOne(id);
      console.log("Removed from unapproved_chemicals:", id);

      res.status(200).json({
        success: true,
        message: "Chemical approved and added to approved_chemicals.",
        id,
      });
    }
  } catch (error) {
    console.error("Error approving unapproved chemical:", error);
    res.status(500).json({
      error: "Failed to approve unapproved chemical",
      details: error.message,
    });
  }
});

// Reject an unapproved chemical (admin only)
app.post("/api/unapproved-chemicals/reject", async (req, res) => {
  try {
    const { adminEmail, id } = req.body;
    console.log("Reject request received:", { adminEmail, id });

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",")
      : [];
    if (!adminEmail || !adminEmails.includes(adminEmail)) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }
    if (!id) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // First, get the record to extract data
    const queryResponse = await index.namespace("unapproved_chemicals").query({
      vector: dummyVector,
      filter: { id: { $eq: id } },
      topK: 1,
      includeMetadata: true,
    });

    console.log("Query response for rejection:", queryResponse);

    let name, email;

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      // Try without filter - maybe the ID is the record ID itself
      const allResponse = await index.namespace("unapproved_chemicals").query({
        vector: dummyVector,
        topK: 1000,
        includeMetadata: true,
      });

      const foundRecord = allResponse.matches?.find((match) => match.id === id);
      if (!foundRecord) {
        return res.status(404).json({ error: "Unapproved chemical not found" });
      }

      name = foundRecord.metadata.name;
      email = foundRecord.metadata.email;
      console.log("Found unapproved chemical for rejection:", {
        name,
        email,
        id,
      });
    } else {
      const request = queryResponse.matches[0];
      name = request.metadata.name;
      email = request.metadata.email;
      console.log("Found unapproved chemical for rejection:", {
        name,
        email,
        id,
      });
    }

    // Remove from user's buy list
    try {
      const buyProductsIndex = pinecone.index("products-you-buy");
      const buyDummyVector = new Array(1024).fill(0);
      buyDummyVector[0] = 1;
      const buyQueryResponse = await buyProductsIndex
        .namespace("products")
        .query({
          vector: buyDummyVector,
          filter: { email: { $eq: email } },
          topK: 1,
          includeMetadata: true,
        });

      if (buyQueryResponse.matches && buyQueryResponse.matches.length > 0) {
        const metadata = buyQueryResponse.matches[0].metadata;
        let existingProducts = [];
        if (Array.isArray(metadata.productList)) {
          existingProducts = metadata.productList;
        } else if (typeof metadata.productList === "string") {
          existingProducts = JSON.parse(metadata.productList);
        }

        // Remove the rejected chemical from user's list
        const normalizedRejected = normalizeName(name);
        const filteredProducts = existingProducts.filter((product) => {
          const normalizedProduct = normalizeName(product);
          return normalizedProduct !== normalizedRejected;
        });

        const recordId = buyQueryResponse.matches[0].id;
        if (filteredProducts.length !== existingProducts.length) {
          await buyProductsIndex.namespace("products").deleteOne(recordId);
          await buyProductsIndex.namespace("products").upsert([
            {
              id: recordId,
              values: buyDummyVector,
              metadata: {
                email: email,
                id: recordId,
                productList: JSON.stringify(filteredProducts),
                productCount: filteredProducts.length,
              },
            },
          ]);
          console.log("Removed from user's buy list:", { email, name });
        }
      }
    } catch (buyError) {
      console.error("Error removing from user's buy list:", buyError);
    }

    // Remove from unapproved_chemicals
    await index.namespace("unapproved_chemicals").deleteOne(id);
    console.log("Removed from unapproved_chemicals:", id);

    res.status(200).json({
      success: true,
      message: "Chemical request rejected and removed from all lists.",
      id,
    });
  } catch (error) {
    console.error("Error rejecting unapproved chemical:", error);
    res.status(500).json({
      error: "Failed to reject unapproved chemical",
      details: error.message,
    });
  }
});

// Get user's product request history
app.get("/api/product-requests/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Query for all requests by this user
    const queryResponse = await index.namespace("product-requests").query({
      vector: dummyVector,
      filter: {
        email: { $eq: email },
      },
      topK: 50,
      includeMetadata: true,
    });

    const userRequests =
      queryResponse.matches?.map((match) => ({
        requestId: match.metadata.requestId,
        productName: match.metadata.productName,
        description: match.metadata.description,
        category: match.metadata.category,
        status: match.metadata.status,
        submittedAt: match.metadata.submittedAt,
        reviewedAt: match.metadata.reviewedAt,
        reviewNotes: match.metadata.reviewNotes,
      })) || [];

    res.status(200).json({
      success: true,
      requests: userRequests,
      count: userRequests.length,
    });
  } catch (error) {
    console.error("Error fetching user product requests:", error);
    res.status(500).json({
      error: "Failed to fetch user requests",
      details: error.message,
    });
  }
});

// Get approved chemicals list
app.get("/api/approved-chemicals", async (req, res) => {
  try {
    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Query for all approved chemicals
    const queryResponse = await index.namespace("approved_chemicals").query({
      vector: dummyVector,
      topK: 10000, // Get all approved chemicals
      includeMetadata: true,
    });

    // Use 'name' field from metadata
    const approvedChemicals =
      queryResponse.matches?.map((match) => match.metadata["name"]) || [];

    res.status(200).json({
      success: true,
      chemicals: approvedChemicals,
      count: approvedChemicals.length,
    });
  } catch (error) {
    console.error("Error fetching approved chemicals:", error);
    res.status(500).json({
      error: "Failed to fetch approved chemicals",
      details: error.message,
    });
  }
});

// Get quotations for a specific seller contact (phone number)
app.get("/api/quotations/:sellerContact", async (req, res) => {
  try {
    const { sellerContact } = req.params;
    const { email, companyName } = req.query;

    if (!sellerContact) {
      return res.status(400).json({
        error: "Seller contact (phone number) is required",
      });
    }

    console.log(`Fetching quotations for seller contact: ${sellerContact}`);
    console.log(`Additional filters - Email: ${email}, Company: ${companyName}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Try different phone number formats to match the seller contact
    const phoneFormats = [
      sellerContact,
      `+91${sellerContact}`,
      `+91 ${sellerContact}`,
      sellerContact.replace("+91", "").replace(/\s/g, ""),
    ];

    // Fetch all records from quotations namespace
    const queryResponse = await index.namespace("quotations").query({
      vector: dummyVector,
      topK: 10000, // Get all records
      includeMetadata: true,
    });

    let allQuotations = (queryResponse.matches || []).filter(match => {
      return match.metadata.sellerContact === sellerContact;
    });

    console.log(`🔍 Total quotations found across all formats: ${allQuotations.length}`);



    if (allQuotations.length > 0) {
      // Transform the data to match the new database format and frontend expectations
      let quotations = allQuotations.map((match) => {
        const metadata = match.metadata;

        // Format the submission date
        let formattedDate = "N/A";
        if (metadata.submissionDate) {
          try {
            const date = new Date(metadata.submissionDate);
            const month = date.toLocaleString("en-US", { month: "short" });
            const day = date.getDate();
            const year = date.getFullYear();
            formattedDate = `${month} ${day}, ${year}`;
          } catch (error) {
            console.log("Error formatting submission date:", error);
            formattedDate = metadata.submissionDate;
          }
        }

        return {
          id: match.id,
          orderId: metadata.orderId || "N/A",
          supplierId: metadata.supplierId || "N/A",
          productName: metadata.product || "Unknown Product",
          unitRate: parseFloat(metadata.unitRate) || 0,
          cashRate: parseFloat(metadata.cashRate) || 0,
          paymentTerms: metadata.paymentTerms || "N/A",
          deliveryTime: metadata.deliveryTime || "N/A",
          additionalExpenses: metadata.additionalExpenses || "N/A",
          description: metadata.description || "No description available",
          sellerContact: metadata.sellerContact || "N/A",
          submissionDate: metadata.submissionDate || null,
          formattedDate: formattedDate,
          // Add additional fields for filtering
          sellerCompany: metadata["Seller Company"] || metadata.companyName || "N/A",
          sellerEmail: metadata["Seller Email"] || "N/A",
        };
      });

      // For debugging: Show all quotations and their metadata
      console.log(`🔍 All quotations found: ${quotations.length}`);
      quotations.forEach(quotation => {
        console.log(`🔍 Quotation ${quotation.id}:`);
        console.log(`   - Product: ${quotation.productName}`);
        console.log(`   - Seller Company: "${quotation.sellerCompany}"`);
        console.log(`   - Seller Email: "${quotation.sellerEmail}"`);
        console.log(`   - Seller Contact: "${quotation.sellerContact}"`);
        console.log(`   - Full quotation object:`, JSON.stringify(quotation, null, 2));
      });

      // Skip email filtering - just use company name
      if (email) {
        console.log(`🔍 Email filter requested: ${email} (skipping for now)`);
      }

      res.status(200).json({
        success: true,
        quotations: quotations,
        count: quotations.length,
      });
    } else {
      // No quotations found for this seller contact
      res.status(200).json({
        success: true,
        quotations: [],
        count: 0,
        message: "No quotations found for this seller contact",
      });
    }
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({
      error: "Failed to fetch quotations",
      details: error.message,
    });
  }
});

// Get inquiries for a specific user number (phone number)
app.get("/api/inquiries/:userNumber", async (req, res) => {
  try {
    const { userNumber } = req.params;
    const { email, companyName } = req.query;

    if (!userNumber) {
      return res.status(400).json({
        error: "User number (phone number) is required",
      });
    }

    console.log(`Fetching inquiries for user number: ${userNumber}`);
    console.log(`Additional filters - Email: ${email}, Company: ${companyName}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Try different phone number formats to match the userNumber field
    const phoneFormats = [
      userNumber,
      `+91${userNumber}`,
      `+91 ${userNumber}`,
      `whatsapp:+91${userNumber}`,
      `whatsapp:+91 ${userNumber}`,
      userNumber.replace("+91", "").replace(/\s/g, ""),
      userNumber.replace("whatsapp:", ""),
    ];

    console.log("Trying phone formats:", phoneFormats);

    let queryResponse = null;
    let matchedFormat = null;

    // Try each format until we find a match
    for (const format of phoneFormats) {
      try {
        // Build filter based on provided parameters
        let filter = {
          userNumber: { $eq: format },
        };

        // Add email filter if provided
        if (email) {
          filter.userEmail = { $eq: email };
        }

        // Add company name filter if provided
        if (companyName) {
          filter.userCompany = { $eq: companyName };
        }

        const response = await index.namespace("buyers").query({
          vector: dummyVector,
          filter: filter,
          topK: 100, // Get up to 100 inquiries
          includeMetadata: true,
        });

        if (response.matches && response.matches.length > 0) {
          queryResponse = response;
          matchedFormat = format;
          console.log(`Found matches with format: ${format}`);
          break;
        }
      } catch (error) {
        console.log(`No matches found with format: ${format}`);
        continue;
      }
    }

    console.log(
      "Pinecone query response for inquiries:",
      JSON.stringify(queryResponse, null, 2)
    );

    if (
      queryResponse &&
      queryResponse.matches &&
      queryResponse.matches.length > 0
    ) {
      // Transform the data to match the new database format and frontend expectations
      const inquiries = queryResponse.matches.map((match) => {
        const metadata = match.metadata;

        // Parse suppliers if it's a string
        let suppliers = [];
        if (metadata.suppliers) {
          try {
            suppliers =
              typeof metadata.suppliers === "string"
                ? JSON.parse(metadata.suppliers)
                : metadata.suppliers;
          } catch (error) {
            console.log("Error parsing suppliers:", error);
            suppliers = [];
          }
        }

        // Format the inquiry date
        let formattedDate = "N/A";
        if (metadata.inquiryDate) {
          try {
            const date = new Date(metadata.inquiryDate);
            const month = date.toLocaleString("en-US", { month: "short" });
            const day = date.getDate();
            const year = date.getFullYear();
            formattedDate = `${month} ${day}, ${year}`;
          } catch (error) {
            console.log("Error formatting date:", error);
            formattedDate = metadata.inquiryDate;
          }
        }

        console.log('🔍 Processing inquiry metadata:', metadata);
        console.log('🔍 metadata.product:', metadata.product);

        return {
          id: match.id,
          orderId: metadata.orderId || "N/A",
          userNumber: metadata.userNumber || "N/A",
          quantity: (metadata.quantity || "N/A").toString(),
          deliveryLocation: metadata.deliveryLocation || "N/A",
          products: metadata.product ? [metadata.product] : [],
          suppliers: suppliers,
          expectedResponses: metadata.expectedResponses || 0,
          comparisonReportLink: metadata.comparisonReportLink || "#",
          inquiryDate: metadata.inquiryDate || null,
          formattedDate: formattedDate,
          responseCount: metadata.responseCount || 0,
          // For backward compatibility, also include the old productName field
          productName: metadata.product || "Unknown Product",
          // Also include the product field for consistency
          product: metadata.product || "Unknown Product",
        };
      });

      res.status(200).json({
        success: true,
        inquiries: inquiries,
        count: inquiries.length,
        matchedFormat: matchedFormat,
      });
    } else {
      // No inquiries found for this user number
      res.status(200).json({
        success: true,
        inquiries: [],
        count: 0,
        message: "No inquiries found for this user number",
        triedFormats: phoneFormats,
      });
    }
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      error: "Failed to fetch inquiries",
      details: error.message,
    });
  }
});

// 1. Add GET /api/unapproved-chemicals endpoint
app.get("/api/unapproved-chemicals", async (req, res) => {
  try {
    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Get ALL records from unapproved_chemicals namespace (no filtering)
    const queryResponse = await index.namespace("unapproved_chemicals").query({
      vector: dummyVector,
      topK: 1000, // Get all records
      includeMetadata: true,
    });

    console.log("Unapproved chemicals query response:", queryResponse);

    const pendingRequests =
      queryResponse.matches?.map((match) => ({
        id: match.id, // Use the actual Pinecone record ID
        name: match.metadata.name,
        email: match.metadata.email,
        status: match.metadata.status || "pending",
        submittedAt: match.metadata.submittedAt,
        aiApproved: match.metadata.aiApproved,
        aiConfidence: match.metadata.aiConfidence,
        aiReasoning: match.metadata.aiReasoning,
      })) || [];

    console.log("Pending requests found:", pendingRequests.length);

    res.status(200).json({
      success: true,
      requests: pendingRequests,
      count: pendingRequests.length,
    });
  } catch (error) {
    console.error("Error fetching unapproved chemicals:", error);
    res.status(500).json({
      error: "Failed to fetch unapproved chemicals",
      details: error.message,
    });
  }
});

// Get all referral data for admin dashboard
app.get("/api/referrals", async (req, res) => {
  try {
    const referrals = await getAllReferrals();
    console.log("Sending referrals to frontend:", referrals); // Debug print
    res.json({ success: true, referrals });
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update pincode for all records with matching seller email
app.put("/api/update-pincode", async (req, res) => {
  try {
    const { email, newPincode } = req.body;

    if (!email || !newPincode) {
      return res.status(400).json({
        error: "Email and new pincode are required",
      });
    }

    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(newPincode)) {
      return res.status(400).json({
        error: "Pincode must be exactly 6 digits",
      });
    }

    console.log(`Updating pincode for email: ${email} to: ${newPincode}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Query for all records with the matching seller email in the chemicals namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
      topK: 1000, // Get up to 1000 records
      includeMetadata: true,
    });

    console.log(
      `Found ${queryResponse.matches?.length || 0} records to update`
    );

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return res.status(404).json({
        error: "No records found for this email address",
      });
    }

    // Prepare records for update with new pincode
    const recordsToUpdate = queryResponse.matches.map((match) => {
      const updatedMetadata = {
        ...match.metadata,
        "PIN Code": newPincode,
      };

      return {
        id: match.id,
        values: dummyVector,
        metadata: updatedMetadata,
      };
    });

    // Update all records
    await index.namespace("chemicals").upsert(recordsToUpdate);

    console.log(
      `Successfully updated pincode for ${recordsToUpdate.length} records`
    );

    res.status(200).json({
      success: true,
      message: `Pincode updated successfully for ${recordsToUpdate.length} records`,
      updatedCount: recordsToUpdate.length,
      newPincode: newPincode,
    });
  } catch (error) {
    console.error("Error updating pincode:", error);
    res.status(500).json({
      error: "Failed to update pincode",
      details: error.message,
    });
  }
});

// Add this after other API endpoints
app.get("/api/daily-metrics", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "chemicals-new"
    );
    const dummyVector = new Array(1536).fill(0);
    // Query all daily metrics (topK large enough for all days)
    const queryResponse = await index.namespace("daily_metrics").query({
      vector: dummyVector,
      topK: 366, // 1 year max
      includeMetadata: true,
    });
    let records = (queryResponse.matches || []).map((rec) => ({
      date: rec.id, // YYYY-MM-DD
      ...rec.metadata,
    }));
    // Filter by date if provided
    if (startDate) {
      records = records.filter((r) => r.date >= startDate);
    }
    if (endDate) {
      records = records.filter((r) => r.date <= endDate);
    }
    // Sort by date ascending
    records.sort((a, b) => a.date.localeCompare(b.date));
    res.json({ success: true, metrics: records });
  } catch (error) {
    console.error("Error fetching daily metrics:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Email configuration:", {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? "****" : "not set",
  });
  console.log("Pinecone configuration:", {
    apiKey: process.env.PINECONE_API_KEY ? "****" : "not set",
    indexName: process.env.PINECONE_INDEX_NAME || "chemicals-new",
  });
});
