const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        // present | absent | present-online
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
            type: String, // stored as "YYYY-MM-DD" for easy lookup
            required: true,
        },
        records: [attendanceRecordSchema],

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// One attendance document per batch+date
attendanceSchema.index({ batch: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);