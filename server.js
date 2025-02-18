const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
// Connect to Database
console.log('JWT_SECRET:', process.env.JWT_SECRET);
connectDB();
authRoutes.stack.forEach((middleware) => {
    if (middleware.route) {
        console.log(`Registered route: ${middleware.route.path}`);
    }
});
console.log("Current server time:", new Date());
app.use(cors({
    origin: [
        'https://courageous-arithmetic-341f5d.netlify.app',
        'https://infinite-backend-cxgtafc7duhsb7dt.canadacentral-01.azurewebsites.net',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));
app.options('*', cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});
// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});