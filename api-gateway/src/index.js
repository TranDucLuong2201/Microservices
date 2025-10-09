require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const todoRoutes = require('../routes/todo');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'API Gateway' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});