var Config = {
    accountSid: process.env.TWILIO_ACCOUNT_SID, // Your Account SID from www.twilio.com/console
    authToken: process.env.TWILIO_AUTH_TOKEN,   // Your Auth Token from www.twilio.com/console
    salonNumber: process.env.SALON_PHONE_NUMBER,
    twilioNumber: process.env.TWILIO_PHONE_NUMBER
};
    
module.exports = Config;