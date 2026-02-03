const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
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

        course: {
            type: String,
            required: true
        },

        enrollmentDate: {
            type: Date,
            default: Date.now
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active"
        },

        address: {
            type: String,
            trim: true
        },

        dateOfBirth: {
            type: Date
        },

        guardianName: {
            type: String,
            trim: true
        },

        guardianPhone: {
            type: String,
            trim: true
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

module.exports = mongoose.model("Student", studentSchema);

