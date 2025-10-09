const users = new Map();

module.exports = {
    users,

    findUserByEmail: (email) => {
        return Array.from(users.values()).find(u => u.email === email);
    },

    createUser: (user) => {
        users.set(user.id, user);
        return user;
    },

    findUserById: (id) => {
        return users.get(id);
    }
};