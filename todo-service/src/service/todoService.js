const Todo = require('../models/Todo');
const { publishEvent } = require('../utils/rabbitmq');

class TodoService {
    async createTodo(userId, title, description, priority = 'medium', dueDate = null, tags = [], category = 'general') {
        try {
            const todo = new Todo({
                userId,
                title,
                description,
                priority,
                dueDate: dueDate && dueDate !== '' ? new Date(dueDate) : null,
                tags,
                category
            });

            await todo.save();

            // Publish event
            await publishEvent('todo_events', 'todo.created', {
                todoId: todo._id.toString(),
                userId,
                timestamp: new Date()
            });

            return {
                success: true,
                message: 'Todo created successfully',
                todo: {
                    id: todo._id.toString(),
                    userId: todo.userId,
                    title: todo.title,
                    description: todo.description,
                    completed: todo.completed,
                    priority: todo.priority,
                    dueDate: todo.dueDate,
                    tags: todo.tags,
                    category: todo.category,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt
                }
            };
        } catch (error) {
            console.error('Create todo error:', error);
            return {
                success: false,
                message: 'Error creating todo',
                todo: null
            };
        }
    }

    async getTodos(userId, filters = {}) {
        try {
            const query = { userId, isArchived: false };
            
            // Apply filters
            if (filters.completed !== undefined) {
                query.completed = filters.completed;
            }
            if (filters.priority) {
                query.priority = filters.priority;
            }
            if (filters.category) {
                query.category = filters.category;
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }

            const todos = await Todo.find(query)
                .sort({ createdAt: -1 })
                .limit(filters.limit || 50);

            return {
                success: true,
                todos: todos.map(todo => ({
                    id: todo._id.toString(),
                    userId: todo.userId,
                    title: todo.title,
                    description: todo.description,
                    completed: todo.completed,
                    priority: todo.priority,
                    dueDate: todo.dueDate,
                    tags: todo.tags,
                    category: todo.category,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt
                }))
            };
        } catch (error) {
            console.error('Get todos error:', error);
            return {
                success: false,
                message: 'Error retrieving todos',
                todos: []
            };
        }
    }

    async getTodo(todoId, userId) {
        try {
            const todo = await Todo.findOne({ _id: todoId, userId });

            if (!todo) {
                return {
                    success: false,
                    message: 'Todo not found',
                    todo: null
                };
            }

            return {
                success: true,
                message: 'Todo found',
                todo: {
                    id: todo._id.toString(),
                    userId: todo.userId,
                    title: todo.title,
                    description: todo.description,
                    completed: todo.completed,
                    priority: todo.priority,
                    dueDate: todo.dueDate,
                    tags: todo.tags,
                    category: todo.category,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt
                }
            };
        } catch (error) {
            console.error('Get todo error:', error);
            return {
                success: false,
                message: 'Error retrieving todo',
                todo: null
            };
        }
    }

    async updateTodo(todoId, userId, title, description, priority = 'medium', dueDate = null, tags = [], category = 'general') {
        try {
            const updateData = {
                title,
                description,
                priority,
                dueDate: dueDate && dueDate !== '' ? new Date(dueDate) : null,
                tags,
                category
            };
            
            const todo = await Todo.findOneAndUpdate(
                { _id: todoId, userId },
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!todo) {
                return {
                    success: false,
                    message: 'Todo not found',
                    todo: null
                };
            }

            return {
                success: true,
                message: 'Todo updated successfully',
                todo: {
                    id: todo._id.toString(),
                    userId: todo.userId,
                    title: todo.title,
                    description: todo.description,
                    completed: todo.completed,
                    priority: todo.priority,
                    dueDate: todo.dueDate,
                    tags: todo.tags,
                    category: todo.category,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt
                }
            };
        } catch (error) {
            console.error('Update todo error:', error);
            return {
                success: false,
                message: 'Error updating todo',
                todo: null
            };
        }
    }

    async deleteTodo(todoId, userId) {
        try {
            const todo = await Todo.findOneAndDelete({ _id: todoId, userId });

            if (!todo) {
                return {
                    success: false,
                    message: 'Todo not found'
                };
            }

            // Publish event
            await publishEvent('todo_events', 'todo.deleted', {
                todoId: todo._id.toString(),
                userId,
                timestamp: new Date()
            });

            return {
                success: true,
                message: 'Todo deleted successfully'
            };
        } catch (error) {
            console.error('Delete todo error:', error);
            return {
                success: false,
                message: 'Error deleting todo'
            };
        }
    }

    async toggleTodo(todoId, userId) {
        try {
            const todo = await Todo.findOne({ _id: todoId, userId });

            if (!todo) {
                return {
                    success: false,
                    message: 'Todo not found',
                    todo: null
                };
            }

            todo.completed = !todo.completed;
            await todo.save();

            return {
                success: true,
                message: 'Todo toggled successfully',
                todo: {
                    id: todo._id.toString(),
                    userId: todo.userId,
                    title: todo.title,
                    description: todo.description,
                    completed: todo.completed,
                    priority: todo.priority,
                    dueDate: todo.dueDate,
                    tags: todo.tags,
                    category: todo.category,
                    createdAt: todo.createdAt,
                    updatedAt: todo.updatedAt
                }
            };
        } catch (error) {
            console.error('Toggle todo error:', error);
            return {
                success: false,
                message: 'Error toggling todo',
                todo: null
            };
        }
    }

    async archiveTodo(todoId, userId) {
        try {
            const todo = await Todo.findOneAndUpdate(
                { _id: todoId, userId },
                { $set: { isArchived: true } },
                { new: true }
            );

            if (!todo) {
                return {
                    success: false,
                    message: 'Todo not found'
                };
            }

            return {
                success: true,
                message: 'Todo archived successfully'
            };
        } catch (error) {
            console.error('Archive todo error:', error);
            return {
                success: false,
                message: 'Error archiving todo'
            };
        }
    }
}

module.exports = new TodoService();