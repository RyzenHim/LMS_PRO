const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },

        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
        },

        label: {
            type: String,
            required: true,
            trim: true,
            // e.g. "Diwali", "Republic Day", "Exam Day", "Sunday Off"
        },

        // type enum
        type: {
            type: String,
            enum: ["public-holiday", "exam", "event", "other"],
            default: "public-holiday",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// One holiday per batch+date
holidaySchema.index({ batch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Holiday", holidaySchema);