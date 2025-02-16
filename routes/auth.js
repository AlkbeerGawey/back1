const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const register= async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        console.log(name,email,password);
        if (existingUser) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'User already exists' }),
            };
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

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'User created successfully',
                token,
                user: { id: user._id, name: user.name, email: user.email }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Error creating user', error: error.message })
        };
    }
};

const login= async (req, res) => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Authentication failed' })
            };
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);
        if (!isValidPassword) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Authentication failed' })
            };
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: 2592000 }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                token,
                user: { id: user._id, name: user.name, email: user.email }
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Login failed', error: error.message })
        };
    }
};

module.exports = router;
exports.handler=async (event,context) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
          statusCode: 200,
          headers,
          body: 'OK',
        };
    }
    const path = event.path.replace('/netlify/functions/auth', '');
    if(event.httpMethod === 'POST' && path=== '/login'){
        return login(event,context);
    }
    if(event.httpMethod === 'POST' && path === '/register'){
        return register(event,context);
    }
    return {
        statusCode: 405,
        headers,
        body: 'Method Not Allowed',
    };
}