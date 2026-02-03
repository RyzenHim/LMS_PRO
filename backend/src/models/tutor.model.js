const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
    {
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

        phone: {
            type: String,
            trim: true
        },

        expertise: {
            type: String,
            required: true
        },

        experience: {
            type: Number,
            default: 0
        },

        qualification: {
            type: String,
            trim: true
        },

        bio: {
            type: String,
            trim: true
        },

        joiningDate: {
            type: Date,
            default: Date.now
        },

        salary: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        },

        deletedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tutor", tutorSchema);

