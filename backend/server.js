const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const app = express();

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080", // Updated to match your frontend URL
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(express.json());

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
  if (error) {
    console.log("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Check if email exists in Pinecone database
app.post("/api/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the index with the correct namespace
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "chemical-frontend"
    );

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

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
      "Pinecone query response:",
      JSON.stringify(queryResponse, null, 2)
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Email found in database
      const supplierData = queryResponse.matches[0].metadata;
      res.status(200).json({
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
      });
    } else {
      // Email not found in database
      res.status(200).json({
        exists: false,
        message:
          "Email is not registered, please register your business with WhatsApp",
      });
    }
  } catch (error) {
    console.error("Error checking email in Pinecone:", error);
    res.status(500).json({
      error: "Failed to check email in database",
      details: error.message,
    });
  }
});

// Get all suppliers/products for a specific email
app.post("/api/suppliers/email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Get the index with the correct namespace
    const index = pinecone.index(
      process.env.PINECONE_INDEX_NAME || "chemical-frontend"
    );

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Query the index for all records with the email in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
      topK: 100, // Get up to 100 products for this email
      includeMetadata: true,
    });

    console.log(
      "Pinecone query response for suppliers:",
      JSON.stringify(queryResponse, null, 2)
    );

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
    console.error("Error fetching suppliers by email:", error);
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

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`Fetching buy products for email: ${email}`);

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Query the index for the email in the "products" namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: {
        email: { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    console.log(
      "Pinecone query response for buy products:",
      JSON.stringify(queryResponse, null, 2)
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const metadata = queryResponse.matches[0].metadata;
      console.log("Found metadata:", metadata);

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
      console.log("Parsed products:", products);

      res.status(200).json({
        success: true,
        products: products,
        count: products.length,
      });
    } else {
      console.log("No matches found for email:", email);
      // No products found for this email
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
    const { email, productName } = req.body;

    console.log("Adding product request:", { email, productName });

    if (!email || !productName) {
      return res
        .status(400)
        .json({ error: "Email and product name are required" });
    }

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // First, check if user already has a record in the "products" namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: {
        email: { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    console.log(
      "Query response for existing record:",
      JSON.stringify(queryResponse, null, 2)
    );

    let existingProducts = [];
    let recordId = null;

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // User already has products, update existing record
      const metadata = queryResponse.matches[0].metadata;
      // Support both array and string for productList
      if (Array.isArray(metadata.productList)) {
        existingProducts = metadata.productList;
      } else if (typeof metadata.productList === "string") {
        existingProducts = JSON.parse(metadata.productList);
      } else {
        existingProducts = [];
      }
      recordId = queryResponse.matches[0].id;
      console.log("Found existing products:", existingProducts);
    } else {
      console.log("No existing record found, will create new one");
    }

    // Check if product already exists (case-insensitive, normalized)
    const normalizedNew = normalizeName(productName);
    const productExists = existingProducts.some((existingProduct) => {
      const normalizedExisting = normalizeName(existingProduct);
      const match = normalizedExisting === normalizedNew;
      console.log(
        `Comparing "${normalizedExisting}" with "${normalizedNew}" -> ${match}`
      );
      return match;
    });

    console.log("Product exists:", productExists);

    if (productExists) {
      return res.status(400).json({
        error: "Product already exists in your list",
      });
    }

    // Add new product
    existingProducts.push(productName);
    console.log("Updated products list:", existingProducts);

    if (recordId) {
      // Delete existing record and recreate with updated data
      console.log("Deleting existing record with ID:", recordId);
      await index.namespace("products").deleteOne(recordId);

      console.log("Creating updated record with ID:", recordId);
      await index.namespace("products").upsert([
        {
          id: recordId,
          values: dummyVector,
          metadata: {
            email: email,
            id: recordId,
            productList: JSON.stringify(existingProducts),
            productCount: existingProducts.length,
          },
        },
      ]);
    } else {
      // Create new record in the "products" namespace
      const newId = `buy_products_${Date.now()}`;
      console.log("Creating new record with ID:", newId);
      await index.namespace("products").upsert([
        {
          id: newId,
          values: dummyVector,
          metadata: {
            email: email,
            id: newId,
            productList: JSON.stringify(existingProducts),
            productCount: existingProducts.length,
          },
        },
      ]);
    }

    console.log("Successfully saved products:", existingProducts);

    res.status(200).json({
      success: true,
      message: "Product added successfully",
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
    const { email, productName } = req.body;

    if (!email || !productName) {
      return res
        .status(400)
        .json({ error: "Email and product name are required" });
    }

    // Get the buy products index
    const index = pinecone.index("products-you-buy");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // Find user's record in the "products" namespace
    const queryResponse = await index.namespace("products").query({
      vector: dummyVector,
      filter: {
        email: { $eq: email },
      },
      topK: 1,
      includeMetadata: true,
    });

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return res.status(404).json({
        error: "No products found for this email",
      });
    }

    const metadata = queryResponse.matches[0].metadata;
    // Support both array and string for productList
    if (Array.isArray(metadata.productList)) {
      existingProducts = metadata.productList;
    } else if (typeof metadata.productList === "string") {
      existingProducts = JSON.parse(metadata.productList);
    } else {
      existingProducts = [];
    }
    const recordId = queryResponse.matches[0].id;

    // Remove the product
    const updatedProducts = existingProducts.filter(
      (product) => product !== productName
    );

    if (updatedProducts.length === existingProducts.length) {
      return res.status(404).json({
        error: "Product not found in your list",
      });
    }

    // Delete existing record and recreate with updated data
    console.log("Deleting existing record with ID:", recordId);
    await index.namespace("products").deleteOne(recordId);

    console.log("Creating updated record with ID:", recordId);
    await index.namespace("products").upsert([
      {
        id: recordId,
        values: dummyVector,
        metadata: {
          email: email,
          id: recordId,
          productList: JSON.stringify(updatedProducts),
          productCount: updatedProducts.length,
        },
      },
    ]);

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
  console.log("Received email request:", req.body);

  const { firstName, lastName, email, company, message, to } = req.body;

  if (!firstName || !lastName || !email || !company || !message || !to) {
    console.log("Missing required fields:", {
      firstName,
      lastName,
      email,
      company,
      message,
      to,
    });
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
    console.log("Attempting to send email to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

// Get profile info for a specific email
app.get("/api/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Get the chemical-frontend index
    const index = pinecone.index("chemical-frontend");
    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;
    // Query the index for the email in the "chemicals" namespace
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
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
    console.error("Error fetching profile info:", error);
    res.status(500).json({
      error: "Failed to fetch profile info",
      details: error.message,
    });
  }
});

// Add sell products for a specific email
app.post("/api/sell-products/add", async (req, res) => {
  try {
    const { email, products } = req.body;

    console.log("Adding sell products request:", { email, products });

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

    // Get the chemical-frontend index
    const index = pinecone.index("chemical-frontend");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // First, get the seller's profile data to use for the new products
    const profileQueryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
      },
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
    console.log("Found seller profile:", profileData);

    // Check for existing products to avoid duplicates
    const existingProductsQuery = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Seller Email Address": { $eq: email },
        "Product Name": { $in: products.map((p) => p.productName) },
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

    console.log(
      "Successfully added products:",
      products.map((p) => p.productName)
    );

    res.status(200).json({
      success: true,
      message: "Products added successfully",
      addedProducts: products.map((p) => p.productName),
      count: products.length,
    });
  } catch (error) {
    console.error("Error adding sell products:", error);
    res.status(500).json({
      error: "Failed to add products",
      details: error.message,
    });
  }
});

// Update a sell product
app.put("/api/sell-products/update", async (req, res) => {
  try {
    const { productId, updatedData } = req.body;

    if (!productId || !updatedData) {
      return res.status(400).json({
        error: "Product ID and updated data are required",
      });
    }

    // Get the chemical-frontend index
    const index = pinecone.index("chemical-frontend");

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
    dummyVector[0] = 1;

    // First, get the existing product to preserve seller information
    const queryResponse = await index.namespace("chemicals").query({
      vector: dummyVector,
      filter: {
        "Product ID": { $eq: productId },
      },
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

    console.log("Successfully updated product:", productId);

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

    // Get the chemical-frontend index
    const index = pinecone.index("chemical-frontend");

    // Delete the product from the database
    await index.namespace("chemicals").deleteOne(productId);

    console.log("Successfully deleted product:", productId);

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

    console.log("Unapproved chemical request submitted:", {
      requestId,
      email,
      productName,
      status: "pending",
    });

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
    if (
      !adminEmail ||
      (adminEmail !== "meet.r@ahduni.edu.in" &&
        adminEmail !== "jay.r1@ahduni.edu.in")
    ) {
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
        id: match.metadata.id,
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
    const { adminEmail, id } = req.body;
    if (
      !adminEmail ||
      (adminEmail !== "meet.r@ahduni.edu.in" &&
        adminEmail !== "jay.r1@ahduni.edu.in")
    ) {
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
    // Get the unapproved chemical details
    const queryResponse = await index.namespace("unapproved_chemicals").query({
      vector: dummyVector,
      filter: { id: { $eq: id } },
      topK: 1,
      includeMetadata: true,
    });
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      return res.status(404).json({ error: "Unapproved chemical not found" });
    }
    const request = queryResponse.matches[0];
    const { name, email } = request.metadata;

    // Add to approved_chemicals
    await index.namespace("approved_chemicals").upsert([
      {
        id: id,
        values: dummyVector,
        metadata: {
          id: id,
          name: name,
          approvedBy: adminEmail,
          approvedAt: new Date().toISOString(),
          requestedBy: email,
        },
      },
    ]);

    // Add to user's buy list
    try {
      const buyProductsIndex = pinecone.index("products-you-buy");
      const buyDummyVector = new Array(1024).fill(0);
      buyDummyVector[0] = 1;

      // Check if user already has a record in the "products" namespace
      const buyQueryResponse = await buyProductsIndex
        .namespace("products")
        .query({
          vector: buyDummyVector,
          filter: { email: { $eq: email } },
          topK: 1,
          includeMetadata: true,
        });

      let existingProducts = [];
      let recordId = null;

      if (buyQueryResponse.matches && buyQueryResponse.matches.length > 0) {
        // User already has products, update existing record
        const metadata = buyQueryResponse.matches[0].metadata;
        if (Array.isArray(metadata.productList)) {
          existingProducts = metadata.productList;
        } else if (typeof metadata.productList === "string") {
          existingProducts = JSON.parse(metadata.productList);
        } else {
          existingProducts = [];
        }
        recordId = buyQueryResponse.matches[0].id;
      }

      // Check if product already exists (case-insensitive, normalized)
      const normalizedNew = normalizeName(name);
      const productExists = existingProducts.some((existingProduct) => {
        const normalizedExisting = normalizeName(existingProduct);
        return normalizedExisting === normalizedNew;
      });

      if (!productExists) {
        // Add new product to user's buy list
        existingProducts.push(name);

        if (recordId) {
          // Update existing record
          await buyProductsIndex.namespace("products").deleteOne(recordId);
          await buyProductsIndex.namespace("products").upsert([
            {
              id: recordId,
              values: buyDummyVector,
              metadata: {
                email: email,
                id: recordId,
                productList: JSON.stringify(existingProducts),
                productCount: existingProducts.length,
              },
            },
          ]);
        } else {
          // Create new record
          const newId = `buy_products_${Date.now()}`;
          await buyProductsIndex.namespace("products").upsert([
            {
              id: newId,
              values: buyDummyVector,
              metadata: {
                email: email,
                id: newId,
                productList: JSON.stringify(existingProducts),
                productCount: existingProducts.length,
              },
            },
          ]);
        }
      }
    } catch (buyError) {
      console.error("Error adding to user's buy list:", buyError);
      // Don't fail the approval if buy list addition fails
    }

    // Delete from unapproved_chemicals
    await index.namespace("unapproved_chemicals").deleteOne(id);
    res.status(200).json({
      success: true,
      message:
        "Chemical approved and added to approved_chemicals and user's buy list",
      id,
    });
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
    if (
      !adminEmail ||
      (adminEmail !== "meet.r@ahduni.edu.in" &&
        adminEmail !== "jay.r1@ahduni.edu.in")
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }
    if (!id) {
      return res.status(400).json({ error: "Request ID is required" });
    }
    const index = pinecone.index("chemicals-new");

    // Delete from unapproved_chemicals
    await index.namespace("unapproved_chemicals").deleteOne(id);
    res.status(200).json({
      success: true,
      message: "Chemical request rejected and removed",
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

    // Create a dummy vector with 1024 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1024).fill(0);
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

    if (!sellerContact) {
      return res.status(400).json({
        error: "Seller contact (phone number) is required",
      });
    }

    console.log(`Fetching quotations for seller contact: ${sellerContact}`);

    // Get the chemicals-new index
    const index = pinecone.index("chemicals-new");

    // Create a dummy vector with 1536 dimensions (first element is 1, rest are 0)
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Query for all quotations by this seller contact in the quotations namespace
    const queryResponse = await index.namespace("quotations").query({
      vector: dummyVector,
      filter: {
        sellerContact: { $eq: sellerContact },
      },
      topK: 100, // Get up to 100 quotations
      includeMetadata: true,
    });

    console.log(
      "Pinecone query response for quotations:",
      JSON.stringify(queryResponse, null, 2)
    );

    if (queryResponse.matches && queryResponse.matches.length > 0) {
      // Transform the data to match the frontend expectations
      const quotations = queryResponse.matches.map((match) => {
        const metadata = match.metadata;
        return {
          id: match.id,
          productName: metadata.product || "Unknown Product",
          unitRate: parseFloat(metadata.unitRate) || 0,
          cashRate: parseFloat(metadata.cashRate) || 0,
          paymentTerms: metadata.paymentTerms || "N/A",
          deliveryTime: metadata.deliveryTime || "N/A",
          additionalExpenses: metadata.additionalExpenses || "N/A",
          description: metadata.description || "No description available",
          orderId: metadata.orderId || "N/A",
          supplierId: metadata.supplierId || "N/A",
        };
      });

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

    if (!userNumber) {
      return res.status(400).json({
        error: "User number (phone number) is required",
      });
    }

    console.log(`Fetching inquiries for user number: ${userNumber}`);

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
        const response = await index.namespace("buyers").query({
          vector: dummyVector,
          filter: {
            userNumber: { $eq: format },
          },
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
      // Transform the data to match the frontend expectations
      const inquiries = queryResponse.matches.map((match) => {
        const metadata = match.metadata;
        return {
          id: match.id,
          orderId: metadata.orderId || "N/A",
          productName: Array.isArray(metadata.products)
            ? metadata.products.join(", ")
            : metadata.products || "Unknown Product",
          deliveryLocation: metadata.deliveryLocation || "N/A",
          quantity: metadata.quantity || "N/A",
          comparisonReportLink: metadata.comparisonReportLink || "#",
          expectedResponses: metadata.expectedResponses || 0,
          responseCount: metadata.responseCount || 0,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Email configuration:", {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? "****" : "not set",
  });
  console.log("Pinecone configuration:", {
    apiKey: process.env.PINECONE_API_KEY ? "****" : "not set",
    indexName: process.env.PINECONE_INDEX_NAME || "chemical-frontend",
  });
});
