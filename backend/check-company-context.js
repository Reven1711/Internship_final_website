const fetch = require('node-fetch');

async function checkCompanyContext() {
  const email = "jay.r1@ahduni.edu.in";
  const baseUrl = "http://localhost:5000"; // Updated to correct port
  
  console.log("=== CHECKING COMPANY CONTEXT ===");
  console.log(`Email: ${email}`);
  
  try {
    // Test the user-companies API endpoint
    const response = await fetch(`${baseUrl}/api/user-companies/${encodeURIComponent(email)}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ API Response successful");
      console.log(`Found ${data.companies.length} companies:`);
      
      data.companies.forEach((company, index) => {
        console.log(`\n--- Company ${index + 1} ---`);
        console.log(`ID: ${company.id}`);
        console.log(`Name: "${company.name}"`);
        console.log(`Contact: ${company.contact}`);
        console.log(`Email: ${company.email}`);
        console.log(`GST: ${company.gst}`);
        console.log(`Region: ${company.region}`);
        console.log(`Address: ${company.address}`);
        console.log(`Verified: ${company.verified}`);
        console.log(`Rating: ${company.rating}`);
      });
      
      // Check if any company name matches "Silicon Conmix Products"
      const siliconCompanies = data.companies.filter(company => 
        company.name.includes("Silicon") && company.name.includes("Conmix")
      );
      
      if (siliconCompanies.length > 0) {
        console.log("\n🎯 Found Silicon Conmix companies in context:");
        siliconCompanies.forEach(company => {
          console.log(`- "${company.name}" (exact match: ${company.name === "Silicon Conmix Products"})`);
        });
      } else {
        console.log("\n❌ No Silicon Conmix companies found in context");
      }
      
    } else {
      console.log("❌ API Error:", data.error);
    }
    
  } catch (error) {
    console.error("❌ Error checking company context:", error.message);
  }
}

if (require.main === module) {
  checkCompanyContext().catch(console.error);
} 