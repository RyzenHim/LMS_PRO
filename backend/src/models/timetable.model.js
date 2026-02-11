const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },

        tutor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tutor",
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        subject: {
            type: String,
            trim: true,
            default: "",
        },

        day: {
            type: String,
            enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            required: true,
        },

        startMinutes: {
            type: Number,
            required: true,
            min: 0,
            max: 1440,
        },

        endMinutes: {
            type: Number,
            required: true,
            min: 0,
            max: 1440,
        },

        room: {
            type: String,
            trim: true,
            default: "",
        },

        note: {
            type: String,
            trim: true,
            default: "",
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

module.exports = mongoose.model("Timetable", timetableSchema);
