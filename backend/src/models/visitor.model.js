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
            type: String,
            enum: ["new", "contacted", "converted", "not-interested", "follow-up"],
            default: "new"
        },
        note: {
            type: String,
        },
        notInterestedReason: {
            type: String,
        },
        followUpDate: {
            type: Date,
        },
        conversionType: {
            type: String,
            enum: ["student", "tutor", "employee", null],
            default: null
        },
        convertedToId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // required: true,
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
