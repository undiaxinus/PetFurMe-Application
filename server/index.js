const cors = require('cors');

app.use(cors({
    origin: [
        'http://localhost:19006', // Expo web
        'http://localhost:3001',  // Your API server
        'exp://192.168.1.13:8081' // Expo mobile
    ],
    credentials: true
})); 