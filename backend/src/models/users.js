const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        uique: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: false
    },
    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },
    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
    },

    isActive: {
        type: Boolean,
        default: "false"
    }
}, { timestamps: true })


module.exports = mongoose.model('Users', userSchema)