const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        status: {
            type: String,
            enum: ["present", "absent", "present-online"],
            required: true,
            default: "absent",
        },
    },
    { _id: false }
);

const attendanceSchema = new mongoose.Schema(
    {
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Batch",
            required: true,
        },

        date: {
            type: String, // YYYY-MM-DD
            required: true,
        },

        slot: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Timetable",
            // required: true,
        },

        records: [attendanceRecordSchema],

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// Unique per batch + date + slot
attendanceSchema.index(
    { batch: 1, date: 1, slot: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);