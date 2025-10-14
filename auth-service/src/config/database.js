const mongoose = require('mongoose');
const User = require('../models/User');

let isConnected = false;

const connectDatabase = async () => {
    if (isConnected) {
        return;
    }
    try {
        const mongoURI = process.env.AUTH_MONGODB_URI || 'mongodb://localhost:27017/todo-microservices-auth';
        await mongoose.connect(mongoURI);
        isConnected = true;
        console.log('Auth service: MongoDB Connected successfully');
    } catch (error) {
        console.error(`Auth service: MongoDB Connected failed: ${error}`);
        process.exit(1);
    }
}

module.exports = {
    connectDatabase,
    User,

    findUserByEmail: async (email) => {
        return User.findOne({email});
    },

    createUser: async (userData) => {
        const user = new User(userData);
        return await user.save();
    },

    findUserById: async (id) => {
        return User.findOne({id});
    }
};