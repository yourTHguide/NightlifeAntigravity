require('dotenv').config();
const { Resend } = require('resend');

console.log('🧪 Starting Resend API Local Test...');

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_EMAIL || 'bestnightlifethailand@gmail.com';

if (!resendApiKey || resendApiKey === 're_your_api_key_here') {
    console.error('❌ ERROR: Missing or default RESEND_API_KEY in local .env file.');
    process.exit(1);
}

console.log(`📧 Configured to send to verified email: ${adminEmail}`);
console.log('⏳ Attempting to send a test email via Resend...');

const resend = new Resend(resendApiKey);

async function runTest() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Bangkok Club Crawl <onboarding@resend.dev>',
            to: adminEmail,
            subject: '🧪 Resend API Debug Test - BEST Nightlife Thailand',
            text: 'If you are receiving this, your Resend API configuration is working perfectly!',
            html: '<p>If you are receiving this, your <strong>Resend API configuration</strong> is working perfectly!</p>'
        });

        if (error) {
            throw error;
        }

        console.log('\n✅ SUCCESS! Email sent successfully.');
        console.log(`📨 Message ID: ${data.id}`);
    } catch (error) {
        console.error('\n❌ FAILED TO SEND EMAIL.');
        console.error('--- RESEND ERROR TRACE ---');
        console.error(error);
    }
}

runTest();
