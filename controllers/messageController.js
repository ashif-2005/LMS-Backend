const twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC52f0dd420b4a94411f9f989cf7749e69'; // Your Account SID from www.twilio.com/console
const authToken = '5ba053a83612b047809b9498ecaff4a5';   // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

const sendMessage = async(req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).send({ error: "To number and message are required" });
    }

    try {
        // Send the message via Twilio
        const response = await client.messages.create({
            body: message,
            from: 'whatsapp:+14155238886', // Twilio's WhatsApp number
            to: `whatsapp:${to}`
        });

        res.status(200).send({
            success: true,
            message: "Message sent successfully",
            data: response
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).send({
            success: false,
            error: error.message
        });
    }
}

module.exports = { sendMessage }