require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🧪 Starting Nodemailer SMTP Local Test...');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_APP_PASSWORD;

if (!emailUser || !emailPass) {
    console.error('❌ ERROR: Missing EMAIL_USER or EMAIL_APP_PASSWORD in local .env file.');
    console.error(`Current EMAIL_USER: ${emailUser ? 'Set' : 'Missing'}`);
    console.error(`Current EMAIL_APP_PASSWORD: ${emailPass ? 'Set' : 'Missing'}`);
    process.exit(1);
}

console.log(`📧 Configured to send from: ${emailUser}`);
console.log('⏳ Attempting to authenticate and send a test email...');

const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    },
    // We can enable logger and debug flags for maximum trace output
    logger: true,
    debug: true
});

async function runTest() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || emailUser; // Fallback to sending to self
        
        const info = await emailTransporter.sendMail({
            from: `"BEST Local Debug" <${emailUser}>`,
            to: adminEmail,
            subject: '🧪 SMTP Debug Test - BEST Nightlife Thailand',
            text: 'If you are receiving this, your SMTP configuration is working perfectly!',
            html: '<p>If you are receiving this, your <strong>SMTP configuration</strong> is working perfectly!</p>'
        });

        console.log('\n✅ SUCCESS! Email sent successfully.');
        console.log(`📨 Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('\n❌ FAILED TO SEND EMAIL.');
        console.error('--- SMTP ERROR TRACE ---');
        console.error(error);
        
        if (error.code === 'EAUTH') {
            console.error('\n💡 HINT: Authentication failed. This usually means:');
            console.error('1. Your Google App Password is wrong or has expired.');
            console.error('2. You are using your normal Gmail password instead of an App Password.');
            console.error('3. 2-Step Verification is not enabled on your Google account.');
        }
    }
}

runTest();
