const OpenAI = require("openai");
require('dotenv').config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAIModeration() {
  console.log("🧪 Testing AI Moderation with Hindi/Gujarati Content...\n");

  const testCases = [
    // Real chemical names (should be ALLOWED)
    { input: "Acetic Acid", expected: "ALLOW", description: "Real chemical name" },
    { input: "Sulfuric Acid", expected: "ALLOW", description: "Real chemical name" },
    { input: "H2SO4", expected: "ALLOW", description: "Chemical formula" },
    { input: "NaOH", expected: "ALLOW", description: "Chemical formula" },
    
    // Hindi slurs (should be BLOCKED)
    { input: "ghadedo", expected: "BLOCK", description: "Hindi slur" },
    { input: "harami", expected: "BLOCK", description: "Hindi slur" },
    { input: "chutiya", expected: "BLOCK", description: "Hindi slur" },
    { input: "madarchod", expected: "BLOCK", description: "Hindi slur" },
    { input: "bhosadike", expected: "BLOCK", description: "Hindi slur" },
    
    // Gujarati slurs (should be BLOCKED)
    { input: "ghadedo", expected: "BLOCK", description: "Gujarati slur" },
    { input: "harami", expected: "BLOCK", description: "Gujarati slur" },
    
    // Random words (should be BLOCKED)
    { input: "randomword", expected: "BLOCK", description: "Random nonsense word" },
    { input: "xyz123", expected: "BLOCK", description: "Random characters" },
    { input: "test", expected: "BLOCK", description: "Test word" },
    
    // Mixed content
    { input: "Acetic Acid ghadedo", expected: "BLOCK", description: "Chemical name with Hindi slur" },
    { input: "H2SO4 harami", expected: "BLOCK", description: "Chemical formula with Hindi slur" },
  ];

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

Product name to analyze: "{INPUT}"

Respond with ONLY "Yes" (if it should be BLOCKED) or "No" (if it should be ALLOWED).`;

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: "${testCase.input}" (${testCase.description})`);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a strict content moderator for a chemical trading platform. You must detect abusive language, slurs, and inappropriate content in ALL languages including Hindi, Gujarati, and other Indian languages. Only respond with 'Yes' (block) or 'No' (allow)." 
          },
          { 
            role: "user", 
            content: prompt.replace("{INPUT}", testCase.input) 
          }
        ],
        max_tokens: 3,
        temperature: 0,
      });

      const aiResponse = completion.choices[0].message.content.trim().toLowerCase();
      const aiApproved = aiResponse.startsWith("no");
      const result = aiApproved ? "ALLOW" : "BLOCK";
      
      if (result === testCase.expected) {
        console.log(`✅ PASS: "${testCase.input}" → ${result} (Expected: ${testCase.expected})`);
        passed++;
      } else {
        console.log(`❌ FAIL: "${testCase.input}" → ${result} (Expected: ${testCase.expected})`);
        failed++;
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ERROR testing "${testCase.input}":`, error.message);
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(`\n⚠️  Some tests failed. The AI moderation might need improvement.`);
  } else {
    console.log(`\n🎉 All tests passed! AI moderation is working correctly.`);
  }
}

// Run the test
testAIModeration()
  .then(() => {
    console.log("\n✅ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }); 