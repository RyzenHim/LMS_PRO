const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);
const studentSchema = new mongoose.Schema(
    {
        visitor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Visitor",
            default: null,
            unique: true,
            sparse: true,
        },

        adhaar: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },

        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            default: null,
        },

        enrollmentDate: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },

        address: { type: String, trim: true },
        dateOfBirth: { type: Date },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },

        guardianName: { type: String, trim: true },
        guardianPhone: { type: String, trim: true },

        profileImage: {
            url: { type: String, trim: true },
            publicId: { type: String, trim: true },
        },

        identityProof: {
            type: {
                type: String,
                enum: ["aadhaar", "pan", "driving-license", "passport", "other"],
            },
            number: { type: String, trim: true },
            frontImage: { url: String, publicId: String },
            backImage: { url: String, publicId: String },
        },

        documents: [fileSchema],

        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
