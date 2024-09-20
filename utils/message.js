const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC52f0dd420b4a94411f9f989cf7749e69'; // Your Account SID from www.twilio.com/console
const authToken = '5ba053a83612b047809b9498ecaff4a5';   // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

const Message = async(to, message) => {
    try {
        // Send the message via Twilio
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
            to: `whatsapp:${to}`
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
    }
}

module.exports = { Message }