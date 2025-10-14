const mongoose = require('mongoose');
const User = require('../models/User');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-microservices';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log('User Service: MongoDB connected successfully');
    } catch (error) {
        console.error('User Service: MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    User,

    findUserById: async (id) => {
        return await User.findOne({ id });
    },

    createUser: async (userData) => {
        const user = new User(userData);
        return await user.save();
    },

    updateUser: async (id, data) => {
        return await User.findOneAndUpdate({ id }, data, { new: true });
    }
};