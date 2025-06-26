const { Pinecone } = require("@pinecone-database/pinecone");
require("dotenv").config();

async function upsertMultipleReferrals() {
  try {
    const pinecone = new Pinecone({
      apiKey: 'pcsk_4FfGit_QF4AWjgqbPZxsWd8U2uhFGjd76o4TAYzHsXPWCE9tTnFX5cLJZB788FDwZUsQoD',
    });
    const index = pinecone.index("chemicals-new");
    const dummyVector = [1, ...new Array(1535).fill(0)];
    const upserts = [];
    for (let i = 1; i <= 50; i++) {
      const phone = `90000000${i.toString().padStart(2, '0')}`;
      // Vary referral count: 0-10, with some above and some below 5
      const referralCount = (i % 11);
      upserts.push({
        id: `whatsapp:+91${phone}`,
        values: dummyVector,
        metadata: {
          phone,
          referralCount,
        },
      });
    }
    await index.namespace("referrals").upsert(upserts);
    console.log(`Upserted 50 dummy referral records in 'referrals' namespace.`);
  } catch (error) {
    console.error("Error upserting referrals:", error);
  }
}

upsertMultipleReferrals(); 