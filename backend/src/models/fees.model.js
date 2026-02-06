const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
    {
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

        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            default: null,
        },

        coursePrice: {
            type: Number,
            required: true,
            default: 0,
        },

        paymentType: {
            type: String,
            enum: ["full", "partial"],
            default: "full",
        },

        paymentMode: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
        },

        amountPaid: {
            type: Number,
            default: 0,
        },

        remainingAmount: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["unpaid", "partial", "paid"],
            default: "unpaid",
        },

        dueDate: {
            type: Date,
            default: null,
        },

        note: {
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

module.exports = mongoose.model("Fees", feesSchema);
