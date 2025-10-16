const express = require('express');
const { userClient } = require('../grpc/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    userClient.GetUserProfile({ userId: req.user.userId }, (error, response) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to get profile' });
        }

        if (!response.success) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: response.user,
            todoCount: response.todoCount || 0
        });
    });
});

// Get user profile by ID (for frontend compatibility)
router.get('/:id/profile', authenticateToken, (req, res) => {
    userClient.GetUserProfile({ userId: req.params.id }, (error, response) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to get profile' });
        }

        if (!response.success) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            user: response.user,
            todoCount: response.todoCount || 0
        });
    });
});

// Update user
router.put('/profile', authenticateToken, (req, res) => {
    const { name, bio, preferences } = req.body;

    userClient.UpdateUser(
        {
            userId: req.user.userId,
            name: name || '',
            bio: bio || '',
            preferences: preferences || {}
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to update user' });
            }

            if (!response.success) {
                return res.status(400).json({ success: false, message: response.message });
            }

            res.json({
                success: true,
                message: response.message,
                user: response.user
            });
        }
    );
});

// Update user by ID (for frontend compatibility)
router.put('/:id', authenticateToken, (req, res) => {
    const { name, bio, preferences } = req.body;

    userClient.UpdateUser(
        {
            userId: req.params.id,
            name: name || '',
            bio: bio || '',
            preferences: preferences || {}
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to update user' });
            }

            if (!response.success) {
                return res.status(400).json({ success: false, message: response.message });
            }

            res.json({
                success: true,
                message: response.message,
                user: response.user
            });
        }
    );
});

module.exports = router;