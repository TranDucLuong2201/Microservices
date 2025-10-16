const express = require('express');
const { authClient } = require('../grpc/client');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password and name are required' });
    }

    authClient.Register({ email, password, name }, (error, response) => {
        if (error) {
            return res.status(500).json({ error: 'Registration failed' });
        }

        if (!response.success) {
            return res.status(400).json({ error: response.message });
        }

        res.status(201).json({
            success: true,
            message: response.message,
            token: response.token,
            userId: response.userId
        });
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    authClient.Login({ email, password }, (error, response) => {
        if (error) {
            return res.status(500).json({ error: 'Login failed' });
        }

        if (!response.success) {
            return res.status(401).json({ error: response.message });
        }

        res.json({
            success: true,
            message: response.message,
            token: response.token,
            userId: response.userId
        });
    });
});

// Verify Token
router.post('/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    authClient.VerifyToken({ token }, (error, response) => {
        if (error) {
            return res.status(500).json({ valid: false, error: 'Token verification failed' });
        }

        res.json({
            valid: response.valid,
            userId: response.userId,
            email: response.email
        });
    });
});

module.exports = router;