const express = require('express');
const { userClient } = require('../grpc/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    userClient.GetUserProfile({ userId: req.user.userId }, (error, response) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to get profile' });
        }

        if (!response.success) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: response.user,
            todoCount: response.todoCount
        });
    });
});

// Update user
router.put('/profile', authenticateToken, (req, res) => {
    const { name, phone } = req.body;

    userClient.UpdateUser(
        {
            userId: req.user.userId,
            name: name || '',
            phone: phone || ''
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to update user' });
            }

            if (!response.success) {
                return res.status(400).json({ error: response.message });
            }

            res.json({
                message: response.message,
                user: response.user
            });
        }
    );
});

module.exports = router;