const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        phone: {
            type: Number,
            trim: true,

        },
        course: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            enum: ["call", "walk-in", "email", "referral", "other"],
            default: "other",
        },
        status: {
            enum: ["new", "contacted", "converted"],
            default: "new"
        },
        note: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
