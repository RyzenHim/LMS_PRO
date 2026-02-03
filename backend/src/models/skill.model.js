const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        description: {
            type: String,
            trim: true
        },

        category: {
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

module.exports = mongoose.model("Skill", skillSchema);
