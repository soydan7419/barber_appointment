require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');

// TEST BİLGİLERİ - BUNLARI KENDİ TEST HESAPLARINIZLA DEĞİŞTİRİN
const testEmail = 'your_test_email@gmail.com'; // Test edeceğiniz email
const testPhone = '+901234567890'; // Test edeceğiniz telefon (ülke kodu ile)
const testMsg = 'Merhaba! Bu bir test mesajıdır, randevu job tetikleme testi.';

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);
oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

async function sendTestEmail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token
      }
    });

    const result = await transporter.sendMail({
      from: `Berber App <${process.env.GMAIL_USER}>`,
      to: testEmail,
      subject: '✅ Gmail Test Mesajı',
      html: `<p>${testMsg}</p>`
    });
    console.log('✅ Gmail testi başarılı:', result.messageId);
  } catch (e) {
    console.error('❌ Gmail testi başarısız:', e.message || e.toString());
  }
}

const twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTestWhatsApp() {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${testPhone}`,
      body: testMsg
    });
    console.log('✅ WhatsApp testi başarılı:', message.sid);
  } catch (e) {
    console.error('❌ WhatsApp testi başarısız:', e.code || e.message || e);
  }
}

(async function() {
  console.log('📨 Gmail testi başlatılıyor...');
  await sendTestEmail();

  console.log('📱 WhatsApp testi başlatılıyor...');
  await sendTestWhatsApp();
})();