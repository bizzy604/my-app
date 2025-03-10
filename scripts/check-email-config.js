require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

async function checkEmailConfig() {
  console.log('Checking email configuration...');
  
  // Check if API key is set
  if (!process.env.MAILERSEND_API_KEY) {
    console.error('❌ MAILERSEND_API_KEY is not defined in your environment variables!');
    console.log('Please add your MailerSend API key to your .env file:');
    console.log('MAILERSEND_API_KEY=your_api_key_here');
    return false;
  }
  
  console.log('✅ MAILERSEND_API_KEY is defined');
  
  // Initialize MailerSend client
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
  });
  
  // Test sending a simple email
  const testEmail = 'test@example.com'; // Replace with your email for testing
  
  const sentFrom = new Sender(
    "noreply@trial-ynrw7gy7362g2k8e.mlsender.net", // This should match your domain in MailerSend
    "Innobid"
  );
  
  const recipients = [
    new Recipient(testEmail)
  ];
  
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Email Configuration Test")
    .setHtml(`
      <div>
        <h1>Email Configuration Test</h1>
        <p>This is a test email to verify your MailerSend configuration.</p>
      </div>
    `)
    .setText("This is a test email to verify your MailerSend configuration.");
  
  try {
    console.log('Attempting to send a test email...');
    const response = await mailerSend.email.send(emailParams);
    console.log('✅ Test email sent successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(JSON.stringify(error, null, 2));
    
    // Check common issues
    if (error.statusCode === 401) {
      console.log('\nAuthentication error. Please check that:');
      console.log('1. Your MailerSend API key is correct');
      console.log('2. Your API key has permission to send emails');
      console.log('3. Your account is active and verified');
    }
    
    if (error?.body?.errors?.from?.email) {
      console.log('\nSender email domain issue:');
      console.log('1. The sender email domain must be verified in your MailerSend account');
      console.log('2. Check if "noreply@trial-ynrw7gy7362g2k8e.mlsender.net" is authorized in your account');
    }
    
    return false;
  }
}

// Run the check
checkEmailConfig()
  .then(success => {
    if (success) {
      console.log('\n🎉 Your email configuration appears to be working correctly!');
    } else {
      console.log('\n❌ Please fix the email configuration issues before proceeding.');
    }
  })
  .catch(error => {
    console.error('An unexpected error occurred:', error);
  }); 