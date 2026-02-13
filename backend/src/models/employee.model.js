const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        department: {
            type: String,
            required: true,
            trim: true,
        },

        designation: {
            type: String,
            required: true,
            trim: true,
        },

        salary: {
            type: Number,
            required: true,
            min: 0,
        },

        joiningDate: {
            type: Date,
            default: Date.now,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
