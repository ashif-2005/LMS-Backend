const twilio = require('twilio');

// Twilio credentials   
const client = new twilio(process.env.SID, process.env.Token);

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