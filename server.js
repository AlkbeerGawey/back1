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
// Middleware
const allowed_orgins=['http://127.0.0.1:5500','https://courageous-arithmetic-341f5d.netlify.app','https://lighthearted-crumble-eeeb5b.netlify.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (allowed_orgins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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