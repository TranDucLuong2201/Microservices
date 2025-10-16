const express = require('express');
const { todoClient } = require('../grpc/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create todo
router.post('/', authenticateToken, (req, res) => {
    const { title, description, priority, dueDate, tags, category } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    todoClient.CreateTodo(
        {
            userId: req.user.userId,
            title,
            description: description || '',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            tags: tags || [],
            category: category || 'general'
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to create todo' });
            }

            res.status(201).json({
                success: true,
                message: response.message,
                todo: response.todo
            });
        }
    );
});

// Get all todos
router.get('/', authenticateToken, (req, res) => {
    todoClient.GetTodos({ userId: req.user.userId }, (error, response) => {
        if (error) {
            return res.status(500).json({ success: false, message: 'Failed to get todos' });
        }

        res.json({
            success: true,
            todos: response.todos || []
        });
    });
});

// Get single todo
router.get('/:id', authenticateToken, (req, res) => {
    todoClient.GetTodo(
        {
            todoId: req.params.id,
            userId: req.user.userId
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to get todo' });
            }

            if (!response.success) {
                return res.status(404).json({ error: response.message });
            }

            res.json({
                todo: response.todo
            });
        }
    );
});

// Update todo
router.put('/:id', authenticateToken, (req, res) => {
    const { title, description, priority, dueDate, tags, category } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    todoClient.UpdateTodo(
        {
            todoId: req.params.id,
            userId: req.user.userId,
            title,
            description: description || '',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            tags: tags || [],
            category: category || 'general'
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to update todo' });
            }

            if (!response.success) {
                return res.status(404).json({ success: false, message: response.message });
            }

            res.json({
                success: true,
                message: response.message,
                todo: response.todo
            });
        }
    );
});

// Toggle todo completion
router.patch('/:id/toggle', authenticateToken, (req, res) => {
    todoClient.ToggleTodo(
        {
            todoId: req.params.id,
            userId: req.user.userId
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to toggle todo' });
            }

            if (!response.success) {
                return res.status(404).json({ success: false, message: response.message });
            }

            res.json({
                success: true,
                message: response.message,
                todo: response.todo
            });
        }
    );
});

// Delete todo
router.delete('/:id', authenticateToken, (req, res) => {
    todoClient.DeleteTodo(
        {
            todoId: req.params.id,
            userId: req.user.userId
        },
        (error, response) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Failed to delete todo' });
            }

            if (!response.success) {
                return res.status(404).json({ success: false, message: response.message });
            }

            res.json({
                success: true,
                message: response.message
            });
        }
    );
});

module.exports = router;