const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

async function testHistoryFiltering() {
  try {
    console.log("🧪 Testing History Section Filtering with Three Fields");
    console.log("=====================================================");

    const index = pinecone.index("chemicals-new");
    const dummyVector = new Array(1536).fill(0);
    dummyVector[0] = 1;

    // Test data
    const testEmail = "jaymr@gmail.com";
    const testPhone1 = "6352615629"; // Jay Reliance
    const testPhone2 = "9876543210"; // Jay Microsoft
    const testCompany1 = "Jay Reliance";
    const testCompany2 = "Jay Microsoft";

    console.log("\n📋 Test Data:");
    console.log(`Email: ${testEmail}`);
    console.log(`Company 1: ${testCompany1} (Phone: ${testPhone1})`);
    console.log(`Company 2: ${testCompany2} (Phone: ${testPhone2})`);

    // Test 1: Check quotations for Jay Reliance
    console.log("\n🔍 Test 1: Checking quotations for Jay Reliance");
    const quotationFilter1 = {
      sellerContact: { $eq: testPhone1 },
      sellerEmail: { $eq: testEmail },
      sellerCompany: { $eq: testCompany1 },
    };

    const quotationResponse1 = await index.namespace("quotations").query({
      vector: dummyVector,
      filter: quotationFilter1,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${quotationResponse1.matches?.length || 0} quotations for Jay Reliance`);
    if (quotationResponse1.matches && quotationResponse1.matches.length > 0) {
      quotationResponse1.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.metadata.product || 'Unknown Product'} (ID: ${match.id})`);
      });
    }

    // Test 2: Check quotations for Jay Microsoft
    console.log("\n🔍 Test 2: Checking quotations for Jay Microsoft");
    const quotationFilter2 = {
      sellerContact: { $eq: testPhone2 },
      sellerEmail: { $eq: testEmail },
      sellerCompany: { $eq: testCompany2 },
    };

    const quotationResponse2 = await index.namespace("quotations").query({
      vector: dummyVector,
      filter: quotationFilter2,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${quotationResponse2.matches?.length || 0} quotations for Jay Microsoft`);
    if (quotationResponse2.matches && quotationResponse2.matches.length > 0) {
      quotationResponse2.matches.forEach((match, index) => {
        console.log(`  ${index + 1}. ${match.metadata.product || 'Unknown Product'} (ID: ${match.id})`);
      });
    }

    // Test 3: Check all quotations for the email (without company filters)
    console.log("\n🔍 Test 3: Checking all quotations for email (no company filters)");
    const quotationFilter3 = {
      sellerEmail: { $eq: testEmail },
    };

    const quotationResponse3 = await index.namespace("quotations").query({
      vector: dummyVector,
      filter: quotationFilter3,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${quotationResponse3.matches?.length || 0} total quotations for email`);
    if (quotationResponse3.matches && quotationResponse3.matches.length > 0) {
      const companies = new Map();
      quotationResponse3.matches.forEach((match) => {
        const companyName = match.metadata.sellerCompany || 'Unknown Company';
        const contact = match.metadata.sellerContact || 'Unknown Contact';
        const productName = match.metadata.product || 'Unknown Product';
        
        if (!companies.has(companyName)) {
          companies.set(companyName, { contact, quotations: [] });
        }
        companies.get(companyName).quotations.push(productName);
      });

      companies.forEach((data, company) => {
        console.log(`  ${company} (${data.contact}): ${data.quotations.length} quotations`);
        data.quotations.forEach((quotation, index) => {
          console.log(`    ${index + 1}. ${quotation}`);
        });
      });
    }

    // Test 4: Check inquiries for Jay Reliance
    console.log("\n🔍 Test 4: Checking inquiries for Jay Reliance");
    const inquiryFilter1 = {
      userNumber: { $eq: testPhone1 },
      userEmail: { $eq: testEmail },
      userCompany: { $eq: testCompany1 },
    };

    const inquiryResponse1 = await index.namespace("buyers").query({
      vector: dummyVector,
      filter: inquiryFilter1,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${inquiryResponse1.matches?.length || 0} inquiries for Jay Reliance`);
    if (inquiryResponse1.matches && inquiryResponse1.matches.length > 0) {
      inquiryResponse1.matches.forEach((match, index) => {
        const products = Array.isArray(match.metadata.products) 
          ? match.metadata.products.join(', ')
          : match.metadata.products || 'Unknown Product';
        console.log(`  ${index + 1}. ${products} (ID: ${match.id})`);
      });
    }

    // Test 5: Check inquiries for Jay Microsoft
    console.log("\n🔍 Test 5: Checking inquiries for Jay Microsoft");
    const inquiryFilter2 = {
      userNumber: { $eq: testPhone2 },
      userEmail: { $eq: testEmail },
      userCompany: { $eq: testCompany2 },
    };

    const inquiryResponse2 = await index.namespace("buyers").query({
      vector: dummyVector,
      filter: inquiryFilter2,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${inquiryResponse2.matches?.length || 0} inquiries for Jay Microsoft`);
    if (inquiryResponse2.matches && inquiryResponse2.matches.length > 0) {
      inquiryResponse2.matches.forEach((match, index) => {
        const products = Array.isArray(match.metadata.products) 
          ? match.metadata.products.join(', ')
          : match.metadata.products || 'Unknown Product';
        console.log(`  ${index + 1}. ${products} (ID: ${match.id})`);
      });
    }

    // Test 6: Check all inquiries for the email (without company filters)
    console.log("\n🔍 Test 6: Checking all inquiries for email (no company filters)");
    const inquiryFilter3 = {
      userEmail: { $eq: testEmail },
    };

    const inquiryResponse3 = await index.namespace("buyers").query({
      vector: dummyVector,
      filter: inquiryFilter3,
      topK: 100,
      includeMetadata: true,
    });

    console.log(`Found ${inquiryResponse3.matches?.length || 0} total inquiries for email`);
    if (inquiryResponse3.matches && inquiryResponse3.matches.length > 0) {
      const companies = new Map();
      inquiryResponse3.matches.forEach((match) => {
        const companyName = match.metadata.userCompany || 'Unknown Company';
        const contact = match.metadata.userNumber || 'Unknown Contact';
        const products = Array.isArray(match.metadata.products) 
          ? match.metadata.products.join(', ')
          : match.metadata.products || 'Unknown Product';
        
        if (!companies.has(companyName)) {
          companies.set(companyName, { contact, inquiries: [] });
        }
        companies.get(companyName).inquiries.push(products);
      });

      companies.forEach((data, company) => {
        console.log(`  ${company} (${data.contact}): ${data.inquiries.length} inquiries`);
        data.inquiries.forEach((inquiry, index) => {
          console.log(`    ${index + 1}. ${inquiry}`);
        });
      });
    }

    console.log("\n✅ History Filtering Test Completed");

  } catch (error) {
    console.error("❌ Error testing history filtering:", error);
  }
}

// Run the test
testHistoryFiltering(); 