const mongoose = require("mongoose");

const batchStudentMapSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tutor",
            required: true,
        },

        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        status: {
            type: String,
            enum: ["active", "removed", "completed"],
            default: "active",
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },

        removedAt: {
            type: Date,
            default: null,
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



module.exports = mongoose.model("BatchStudentMap", batchStudentMapSchema);
