const todos = new Map();

module.exports = {
    todos,

    createTodo: (todo) => {
        todos.set(todo.id, todo);
        return todo;
    },

    findTodoById: (id) => {
        return todos.get(id);
    },

    findTodosByUserId: (userId) => {
        return Array.from(todos.values()).filter(t => t.userId === userId);
    },

    updateTodo: (id, data) => {
        const todo = todos.get(id);
        if (!todo) return null;

        const updated = { ...todo, ...data };
        todos.set(id, updated);
        return updated;
    },

    deleteTodo: (id) => {
        const todo = todos.get(id);
        if (!todo) return null;

        todos.delete(id);
        return todo;
    }
};