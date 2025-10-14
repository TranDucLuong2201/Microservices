const mongoose = require('mongoose');
const Todo = require('../models/Todo');

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
        console.log('Todo Service: MongoDB connected successfully');
    } catch (error) {
        console.error('Todo Service: MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = {
    connectDB,
    Todo,

    createTodo: async (todoData) => {
        const todo = new Todo(todoData);
        return await todo.save();
    },

    findTodoById: async (id) => {
        return await Todo.findOne({ id });
    },

    findTodosByUserId: async (userId) => {
        return await Todo.find({ userId }).sort({ createdAt: -1 });
    },

    updateTodo: async (id, data) => {
        return await Todo.findOneAndUpdate({ id }, data, { new: true });
    },

    deleteTodo: async (id) => {
        return await Todo.findOneAndDelete({ id });
    }
};