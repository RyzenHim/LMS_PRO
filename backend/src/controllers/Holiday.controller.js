const Holiday = require("../models/Holiday.model");
const Batch = require("../models/batch.model");

exports.getHolidaysByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const holidays = await Holiday.find({ batch: batchId })
            .sort({ date: 1 })
            .lean();

        return res.status(200).json({ holidays });
    } catch (err) {
        console.error("getHolidaysByBatch error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.addHoliday = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { date, label, type } = req.body;

        if (!date) return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
        if (!label || !label.trim()) return res.status(400).json({ message: "label is required" });

        const batch = await Batch.findOne({ _id: batchId, isDeleted: false });
        if (!batch) return res.status(404).json({ message: "Batch not found" });

        const allowedTypes = ["public-holiday", "exam", "event", "other"];
        const holidayType = allowedTypes.includes(type) ? type : "public-holiday";

        // upsert — if same batch+date exists, update label/type
        const holiday = await Holiday.findOneAndUpdate(
            { batch: batchId, date },
            {
                $set: {
                    batch: batchId,
                    date,
                    label: label.trim(),
                    type: holidayType,
                    createdBy: req.user?._id || null,
                },
            },
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(201).json({ message: "Holiday added successfully", holiday });
    } catch (err) {
        console.error("addHoliday error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// UPDATE a holiday
// PUT /holidays/:id
// Body: { label, type }
// ─────────────────────────────────────────────
exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, type } = req.body;

        const holiday = await Holiday.findById(id);
        if (!holiday) return res.status(404).json({ message: "Holiday not found" });

        if (label !== undefined) holiday.label = label.trim();
        if (type !== undefined) holiday.type = type;

        await holiday.save();
        return res.status(200).json({ message: "Holiday updated", holiday });
    } catch (err) {
        console.error("updateHoliday error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
// DELETE a holiday (remove the holiday marker for a date)
// DELETE /holidays/:id
// ─────────────────────────────────────────────
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findByIdAndDelete(id);
        if (!holiday) return res.status(404).json({ message: "Holiday not found" });

        return res.status(200).json({ message: "Holiday removed successfully" });
    } catch (err) {
        console.error("deleteHoliday error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────
// DELETE holiday by batch+date (convenient for UI)
// DELETE /holidays/batch/:batchId/date/:date
// ─────────────────────────────────────────────
exports.deleteHolidayByDate = async (req, res) => {
    try {
        const { batchId, date } = req.params;

        const holiday = await Holiday.findOneAndDelete({ batch: batchId, date });
        if (!holiday) return res.status(404).json({ message: "Holiday not found for this date" });

        return res.status(200).json({ message: "Holiday removed successfully" });
    } catch (err) {
        console.error("deleteHolidayByDate error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};