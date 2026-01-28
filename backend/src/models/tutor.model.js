// models/Tutor.js
const mongoose = require("mongoose");

const tutorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        expertise: [
            {
                type: String,
            },
        ],

        assignedCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        salary: {
            type: Number,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tutor", tutorSchema);
