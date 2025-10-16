const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { publishEvent } = require('../utils/rabbitmq');

class AuthService {
    async register(email, password, name) {
        try {
            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already exists',
                    token: '',
                    userId: ''
                };
            }

            // Create user (password will be hashed by pre-save middleware)
            const user = new User({
                email,
                password,
                name
            });

            await user.save();

            // Generate token
            const token = jwt.sign(
                { userId: user._id.toString(), email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Publish event to RabbitMQ
            await publishEvent('user_events', 'user.registered', {
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                timestamp: new Date()
            });

            return {
                success: true,
                message: 'User registered successfully',
                token,
                userId: user._id.toString()
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Registration failed',
                token: '',
                userId: ''
            };
        }
    }

    async login(email, password) {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return {
                    success: false,
                    message: 'Invalid credentials',
                    token: '',
                    userId: ''
                };
            }

            const isValidPassword = await user.comparePassword(password);

            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Invalid credentials',
                    token: '',
                    userId: ''
                };
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { userId: user._id.toString(), email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Publish login event
            await publishEvent('user_events', 'user.logged_in', {
                userId: user._id.toString(),
                email: user.email,
                timestamp: new Date()
            });

            return {
                success: true,
                message: 'Login successful',
                token,
                userId: user._id.toString()
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Login failed',
                token: '',
                userId: ''
            };
        }
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

    async getUserById(userId) {
        try {
            const user = await User.findById(userId);
            return user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
}

module.exports = new AuthService();