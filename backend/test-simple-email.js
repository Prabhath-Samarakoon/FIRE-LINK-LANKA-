const nodemailer = require('nodemailer');

// Test email functionality
async function testSimpleEmail() {
  console.log('🧪 Testing simple email functionality...\n');

  const testEmail = 'shanukaw28@gmail.com'; // Your email for testing
  const testPaymentData = {
    staffName: 'John Doe',
    paymentType: 'salary',
    amount: 50000,
    currency: 'LKR',
    paymentDate: new Date(),
    description: 'Monthly salary for February 2024',
    status: 'pending'
  };

  try {
    console.log(`📧 Sending test email to: ${testEmail}`);
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shanukaw28@gmail.com',
        pass: 'mhad ghda pgdq glkn'
      }
    });

    const mailOptions = {
      from: 'shanukaw28@gmail.com',
      to: testEmail,
      subject: `Payment Notification - ${testPaymentData.paymentType} | FireLink Lanka`,
      text: `
Payment Details:
- Staff: ${testPaymentData.staffName}
- Type: ${testPaymentData.paymentType}
- Amount: ${testPaymentData.currency} ${testPaymentData.amount}
- Date: ${new Date(testPaymentData.paymentDate).toLocaleDateString()}
- Description: ${testPaymentData.description}
- Status: ${testPaymentData.status}

FireLink Lanka - Professional Emergency Response Management
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Check your email at: ${testEmail}`);

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n📝 Make sure to:');
    console.log('   1. Set up your .env file with real email credentials');
    console.log('   2. Use a valid Gmail account with App Password');
    console.log('   3. Replace your-test-email@gmail.com with a real email');
  }
}

// Run the test
testSimpleEmail();
