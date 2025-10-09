const db = require('../config/database');

class UserService {
    getUser(userId) {
        const user = db.findUserById(userId);

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
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone || ''
            }
        };
    }

    updateUser(userId, name, phone) {
        const updated = db.updateUser(userId, { name, phone });

        if (!updated) {
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
                id: updated.id,
                email: updated.email,
                name: updated.name,
                phone: updated.phone || ''
            }
        };
    }

    getUserProfile(userId) {
        const user = db.findUserById(userId);

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
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone || ''
            },
            todoCount: user.todoCount || 0
        };
    }

    // Event handlers
    handleUserRegistered(data) {
        const { userId, email, name } = data;
        db.createUser({
            id: userId,
            email,
            name,
            phone: '',
            todoCount: 0
        });
        console.log(`👤 User created: ${email}`);
    }

    incrementTodoCount(userId) {
        const user = db.findUserById(userId);
        if (user) {
            user.todoCount = (user.todoCount || 0) + 1;
            db.updateUser(userId, { todoCount: user.todoCount });
        }
    }

    decrementTodoCount(userId) {
        const user = db.findUserById(userId);
        if (user && user.todoCount > 0) {
            user.todoCount -= 1;
            db.updateUser(userId, { todoCount: user.todoCount });
        }
    }
}

module.exports = new UserService();