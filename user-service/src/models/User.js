const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Virtual for todo count (will be populated from todo service)
userSchema.virtual('todoCount', {
    ref: 'Todo',
    localField: '_id',
    foreignField: 'userId',
    count: true
});

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    return user;
};

module.exports = mongoose.model('User', userSchema);
