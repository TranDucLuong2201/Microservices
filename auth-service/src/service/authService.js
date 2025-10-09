const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { publishEvent } = require('../utils/rabbitmq');

class AuthService {
    async register(email, password, name) {
        // Check if user exists
        const existingUser = db.findUserByEmail(email);
        if (existingUser) {
            return {
                success: false,
                message: 'Email already exists',
                token: '',
                userId: ''
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        const user = {
            id: userId,
            email,
            password: hashedPassword,
            name,
            createdAt: new Date()
        };

        db.createUser(user);

        // Generate token
        const token = jwt.sign(
            { userId, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Publish event to RabbitMQ
        await publishEvent('user_events', 'user.registered', {
            userId,
            email,
            name,
            timestamp: new Date()
        });

        return {
            success: true,
            message: 'User registered successfully',
            token,
            userId
        };
    }

    async login(email, password) {
        const user = db.findUserByEmail(email);

        if (!user) {
            return {
                success: false,
                message: 'Invalid credentials',
                token: '',
                userId: ''
            };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return {
                success: false,
                message: 'Invalid credentials',
                token: '',
                userId: ''
            };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Publish login event
        await publishEvent('user_events', 'user.logged_in', {
            userId: user.id,
            email: user.email,
            timestamp: new Date()
        });

        return {
            success: true,
            message: 'Login successful',
            token,
            userId: user.id
        };
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return {
                valid: true,
                userId: decoded.userId,
                email: decoded.email
            };
        } catch (error) {
            return {
                valid: false,
                userId: '',
                email: ''
            };
        }
    }
}

module.exports = new AuthService();