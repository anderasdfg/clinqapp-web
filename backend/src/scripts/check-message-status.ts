import twilio from 'twilio';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.error('❌ Missing Twilio credentials');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function checkMessageStatus(messageSid: string) {
  try {
    const message = await client.messages(messageSid).fetch();
    
    console.log(`📱 Message SID: ${message.sid}`);
    console.log(`📞 To: ${message.to}`);
    console.log(`📞 From: ${message.from}`);
    console.log(`📝 Body: ${message.body}`);
    console.log(`📊 Status: ${message.status}`);
    console.log(`📅 Date Created: ${message.dateCreated}`);
    console.log(`📅 Date Updated: ${message.dateUpdated}`);
    console.log(`📅 Date Sent: ${message.dateSent}`);
    
    if (message.errorCode) {
      console.log(`❌ Error Code: ${message.errorCode}`);
      console.log(`❌ Error Message: ${message.errorMessage}`);
    }
    
    console.log('---');
    
  } catch (error) {
    console.error(`❌ Error checking message ${messageSid}:`, error);
  }
}

async function checkRecentMessages() {
  try {
    console.log('🔍 Checking recent messages to +51946719657...\n');
    
    const messages = await client.messages.list({
      to: 'whatsapp:+51946719657',
      limit: 5
    });
    
    for (const message of messages) {
      await checkMessageStatus(message.sid);
    }
    
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
  }
}

// Ejecutar el script
checkRecentMessages().then(() => {
  console.log('✅ Message status check completed');
  process.exit(0);
});
