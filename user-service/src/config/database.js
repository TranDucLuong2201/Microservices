const users = new Map();

module.exports = {
    users,

    findUserById: (id) => {
        return users.get(id);
    },

    createUser: (user) => {
        users.set(user.id, user);
        return user;
    },

    updateUser: (id, data) => {
        const user = users.get(id);
        if (!user) return null;

        const updated = { ...user, ...data };
        users.set(id, updated);
        return updated;
    }
};