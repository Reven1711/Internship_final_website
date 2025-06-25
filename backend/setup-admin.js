const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupAdminEmails() {
  console.log('🔧 Setting up Admin Email Configuration...\n');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, 'env.example');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Please create a .env file in the backend directory.');
    console.log('📋 You can copy from env.example as a template.\n');
    
    if (fs.existsSync(envExamplePath)) {
      console.log('📄 Example .env file content:');
      const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
      console.log(exampleContent);
    }
    
    rl.close();
    return;
  }
  
  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if ADMIN_EMAILS already exists
  if (envContent.includes('ADMIN_EMAILS=')) {
    const currentMatch = envContent.match(/ADMIN_EMAILS=(.+)/);
    if (currentMatch) {
      const currentEmails = currentMatch[1].trim();
      console.log(`📧 Current admin emails: ${currentEmails}`);
      
      const answer = await new Promise(resolve => {
        rl.question('\nDo you want to update the admin emails? (y/n): ', resolve);
      });
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('✅ Keeping current admin emails.');
        rl.close();
        return;
      }
    }
  }
  
  // Get admin emails from user
  console.log('\n📝 Enter admin email addresses (comma-separated):');
  console.log('Example: admin1@example.com,admin2@example.com');
  
  const adminEmails = await new Promise(resolve => {
    rl.question('Admin emails: ', resolve);
  });
  
  if (!adminEmails.trim()) {
    console.log('❌ No admin emails provided. Setup cancelled.');
    rl.close();
    return;
  }
  
  // Validate email format (basic validation)
  const emails = adminEmails.split(',').map(email => email.trim());
  const validEmails = emails.filter(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  });
  
  if (validEmails.length !== emails.length) {
    console.log('⚠️  Some email addresses appear to be invalid:');
    emails.forEach(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log(`   ❌ ${email}`);
      }
    });
    
    const continueAnswer = await new Promise(resolve => {
      rl.question('\nContinue anyway? (y/n): ', resolve);
    });
    
    if (continueAnswer.toLowerCase() !== 'y' && continueAnswer.toLowerCase() !== 'yes') {
      console.log('❌ Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Update .env file
  const adminEmailsLine = `ADMIN_EMAILS=${validEmails.join(',')}`;
  
  if (envContent.includes('ADMIN_EMAILS=')) {
    // Replace existing line
    envContent = envContent.replace(/ADMIN_EMAILS=.+/g, adminEmailsLine);
  } else {
    // Add new line
    envContent += `\n# Admin Configuration\n${adminEmailsLine}\n`;
  }
  
  // Write back to .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Admin emails updated successfully!');
  console.log(`📧 Admin emails: ${validEmails.join(', ')}`);
  console.log('\n🔄 Restart your server for changes to take effect.');
  
  rl.close();
}

setupAdminEmails()
  .catch(error => {
    console.error('❌ Error during setup:', error);
    rl.close();
  }); 