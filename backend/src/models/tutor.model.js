const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            unique: true,
        },

        expertise: {
            type: String,
            required: true,
            trim: true,
        },

        experience: {
            type: Number,
            default: 0,
            min: 0,
        },

        qualification: {
            type: String,
            trim: true,
        },

        bio: {
            type: String,
            trim: true,
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

module.exports = mongoose.model("Tutor", tutorSchema);
