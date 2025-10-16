const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        default: '',
        maxlength: 1000
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    tags: [{
        type: String,
        trim: true
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        default: 'general',
        trim: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, createdAt: -1 });
todoSchema.index({ dueDate: 1 });

// Virtual for formatted due date
todoSchema.virtual('formattedDueDate').get(function() {
    if (!this.dueDate) return null;
    return this.dueDate.toISOString().split('T')[0];
});

// Remove sensitive data from JSON output
todoSchema.methods.toJSON = function() {
    const todo = this.toObject();
    return todo;
};

module.exports = mongoose.model('Todo', todoSchema);
