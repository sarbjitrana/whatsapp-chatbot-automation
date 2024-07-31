const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// Define the chatbot's name
const chatbotName = 'ChatBot';

// Initialize the WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate and display QR code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code generated, scan it with your WhatsApp.');
});

// Log when the client is ready
client.on('ready', () => {
    console.log(`${chatbotName} is ready!`);
});

// Log client authenticated
client.on('authenticated', () => {
    console.log('Client authenticated!');
});

// Log client disconnected
client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

// Define responses for various keywords
const responses = {
    'hi': `Hello! I am ${chatbotName}. How can I help you today? Type "menu" to see options.`,
    'menu': `Here are some options you can choose from:\n1. Services\n2. Pricing\n3. Contact\n4. Weather`,
    'services': `${chatbotName} offers a range of services including web development, mobile app development, and digital marketing.`,
    'pricing': `Our pricing varies depending on the service you need. Please provide more details about your requirements.`,
    'contact': `You can contact us at support@example.com or call us at +1234567890.`,
    // Add more keyword responses as needed
};

// Function to fetch weather information
async function getWeather(city) {
    const apiKey = 'YOUR_API_KEY';  // Replace with your weather API key
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    try {
        const response = await axios.get(url);
        const weather = response.data.current.condition.text;
        const temp = response.data.current.temp_c;
        return `The weather in ${city} is ${weather} with a temperature of ${temp}°C.`;
    } catch (error) {
        console.log('Error fetching weather:', error);
        return 'Sorry, I could not retrieve the weather information at this time.';
    }
}

// Respond to incoming messages
client.on('message', async message => {
    console.log(`Message from ${message.from}: ${message.body}`);
    
    const userMessage = message.body.toLowerCase();
    
    if (responses[userMessage]) {
        console.log(`Responding with predefined message: ${responses[userMessage]}`);
        message.reply(responses[userMessage]);
    } else if (userMessage.startsWith('weather')) {
        const city = userMessage.split(' ')[1];
        if (city) {
            const weatherInfo = await getWeather(city);
            console.log(`Responding with weather info: ${weatherInfo}`);
            message.reply(weatherInfo);
        } else {
            message.reply('Please specify a city to get the weather information. Example: "weather London"');
        }
    } else if (!isNaN(userMessage) && parseInt(userMessage) > 0 && parseInt(userMessage) <= 4) {
        console.log(`Responding to menu selection: ${userMessage}`);
        switch (parseInt(userMessage)) {
            case 1:
                message.reply(responses['services']);
                break;
            case 2:
                message.reply(responses['pricing']);
                break;
            case 3:
                message.reply(responses['contact']);
                break;
            case 4:
                message.reply('Please provide the city name. Example: "weather London"');
                break;
        }
    } else {
        message.reply(`I am sorry, I didn't understand that. Type "menu" to see options.`);
    }
});

// Initialize the client
client.initialize();
