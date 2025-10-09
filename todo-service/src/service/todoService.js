const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { publishEvent } = require('../utils/rabbitmq');

class TodoService {
    async createTodo(userId, title, description) {
        const todoId = uuidv4();
        const todo = {
            id: todoId,
            userId,
            title,
            description,
            completed: false,
            createdAt: new Date().toISOString()
        };

        db.createTodo(todo);

        // Publish event
        await publishEvent('todo_events', 'todo.created', {
            todoId,
            userId,
            timestamp: new Date()
        });

        return {
            success: true,
            message: 'Todo created successfully',
            todo
        };
    }

    getTodos(userId) {
        const todos = db.findTodosByUserId(userId);

        return {
            success: true,
            todos
        };
    }

    getTodo(todoId, userId) {
        const todo = db.findTodoById(todoId);

        if (!todo || todo.userId !== userId) {
            return {
                success: false,
                message: 'Todo not found',
                todo: null
            };
        }

        return {
            success: true,
            message: 'Todo found',
            todo
        };
    }

    updateTodo(todoId, userId, title, description) {
        const todo = db.findTodoById(todoId);

        if (!todo || todo.userId !== userId) {
            return {
                success: false,
                message: 'Todo not found',
                todo: null
            };
        }

        const updated = db.updateTodo(todoId, { title, description });

        return {
            success: true,
            message: 'Todo updated successfully',
            todo: updated
        };
    }

    async deleteTodo(todoId, userId) {
        const todo = db.findTodoById(todoId);

        if (!todo || todo.userId !== userId) {
            return {
                success: false,
                message: 'Todo not found'
            };
        }

        db.deleteTodo(todoId);

        // Publish event
        await publishEvent('todo_events', 'todo.deleted', {
            todoId,
            userId,
            timestamp: new Date()
        });

        return {
            success: true,
            message: 'Todo deleted successfully'
        };
    }

    toggleTodo(todoId, userId) {
        const todo = db.findTodoById(todoId);

        if (!todo || todo.userId !== userId) {
            return {
                success: false,
                message: 'Todo not found',
                todo: null
            };
        }

        const updated = db.updateTodo(todoId, { completed: !todo.completed });

        return {
            success: true,
            message: 'Todo toggled successfully',
            todo: updated
        };
    }
}

module.exports = new TodoService();