const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const setCorsHeaders = (response) => {
    return {
        ...response,
        headers: {
            ...response.headers,
            'Access-Control-Allow-Origin': '*', // Allow all origins (adjust this for security)
            'Access-Control-Allow-Methods': 'GET, POST',  // Methods allowed
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',  // Allowed headers
        },
    };
};
const register= async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return setCorsHeaders({
                statusCode: 400,
                body: JSON.stringify({ message: 'User already exists' }),
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 2592000 }
        );

        return setCorsHeaders({
            statusCode: 201,
            body: JSON.stringify({
                message: 'User created successfully',
                token,
                user: { id: user._id, name: user.name, email: user.email }
            })
        });
    } catch (error) {
        return setCorsHeaders({
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating user', error: error.message })
        });
    }
};

const login= async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return setCorsHeaders({
                statusCode: 401,
                body: JSON.stringify({ message: 'Authentication failed' })
            });
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);
        if (!isValidPassword) {
            return setCorsHeaders({
                statusCode: 401,
                body: JSON.stringify({ message: 'Authentication failed' })
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 2592000 }
        );

        return setCorsHeaders({
            statusCode: 200,
            body: JSON.stringify({
                token,
                user: { id: user._id, name: user.name, email: user.email }
            })
        });
    } catch (error) {
        return setCorsHeaders({
            statusCode: 500,
            body: JSON.stringify({ message: 'Login failed', error: error.message })
        });
    }
};

module.exports = router;
exports.handler=async (event,context) => {
    if (event.httpMethod === 'OPTIONS') {
        return setCorsHeaders({
            statusCode: 200,
            body: JSON.stringify({ message: 'CORS preflight response' })
        });
    }
    if(event.httpMethod === 'POST' && event.path === '/login'){
        return login(event,context);
    }
    if(event.httpMethod === 'POST' && event.path === '/register'){
        return register(event,context);
    }
    return setCorsHeaders({
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
    });
}