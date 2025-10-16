const User = require('../models/User');

class UserService {
    async getUser(userId) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    user: null
                };
            }

            return {
                success: true,
                message: 'User found',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    bio: user.bio,
                    preferences: user.preferences,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            console.error('Get user error:', error);
            return {
                success: false,
                message: 'Error retrieving user',
                user: null
            };
        }
    }

    async updateUser(userId, updateData) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    user: null
                };
            }

            return {
                success: true,
                message: 'User updated successfully',
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    bio: user.bio,
                    preferences: user.preferences,
                    createdAt: user.createdAt
                }
            };
        } catch (error) {
            console.error('Update user error:', error);
            return {
                success: false,
                message: 'Error updating user',
                user: null
            };
        }
    }

    async getUserProfile(userId) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                return {
                    success: false,
                    user: null,
                    todoCount: 0
                };
            }

            return {
                success: true,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    bio: user.bio,
                    preferences: user.preferences,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                },
                todoCount: user.todoCount || 0
            };
        } catch (error) {
            console.error('Get user profile error:', error);
            return {
                success: false,
                user: null,
                todoCount: 0
            };
        }
    }

    // Event handlers
    async handleUserRegistered(data) {
        try {
            const { userId, email, name } = data;
            const user = new User({
                _id: userId,
                email,
                name,
                bio: '',
                preferences: {
                    theme: 'light',
                    notifications: true
                }
            });

            await user.save();
            console.log(`👤 User created: ${email}`);
        } catch (error) {
            console.error('Handle user registered error:', error);
        }
    }

    async incrementTodoCount(userId) {
        try {
            await User.findByIdAndUpdate(
                userId,
                { $inc: { todoCount: 1 } }
            );
        } catch (error) {
            console.error('Increment todo count error:', error);
        }
    }

    async decrementTodoCount(userId) {
        try {
            await User.findByIdAndUpdate(
                userId,
                { $inc: { todoCount: -1 } },
                { todoCount: { $gte: 0 } }
            );
        } catch (error) {
            console.error('Decrement todo count error:', error);
        }
    }
}

module.exports = new UserService();