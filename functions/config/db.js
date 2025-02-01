const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const result = require('dotenv').config({ path: path.resolve(__dirname, '.env') });

if (result.error) {
  console.error("Error loading .env file:", result.error);
} else {
  console.log(".env file loaded successfully:", result.parsed);
}
console.log("MongoDB URI:", process.env.URI);
const mongoose = require('mongoose');
console.log();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;