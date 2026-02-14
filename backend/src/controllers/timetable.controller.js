const Timetable = require("../models/timetable.model");
const Batch = require("../models/batch.model");
const Tutor = require("../models/tutor.model");
const Course = require("../models/course.model");

const isOverlap = (existingStart, existingEnd, newStart, newEnd) => {
    return existingStart < newEnd && existingEnd > newStart;
};

exports.createSlot = async (req, res) => {
    try {
        const { batch, tutor, course, subject, day, startMinutes, endMinutes, room } =
            req.body;

        if (!batch || !tutor || !course || !day) {
            return res.status(400).json({ message: "batch, tutor, course, day required" });
        }

        if (startMinutes === undefined || endMinutes === undefined) {
            return res.status(400).json({ message: "startMinutes and endMinutes required" });
        }

        if (startMinutes >= endMinutes) {
            return res.status(400).json({ message: "startMinutes must be < endMinutes" });
        }

        const batchDoc = await Batch.findOne({ _id: batch, isDeleted: false });
        if (!batchDoc) return res.status(404).json({ message: "Batch not found" });

        const tutorDoc = await Tutor.findOne({ _id: tutor, isDeleted: false });
        if (!tutorDoc) return res.status(404).json({ message: "Tutor not found" });

        const courseDoc = await Course.findOne({ _id: course, isDeleted: false });
        if (!courseDoc) return res.status(404).json({ message: "Course not found" });

        const batchSlots = await Timetable.find({
            batch,
            day,
            isDeleted: false,
        });

        const batchConflict = batchSlots.find((s) =>
            isOverlap(s.startMinutes, s.endMinutes, startMinutes, endMinutes)
        );

        if (batchConflict) {
            return res.status(400).json({
                message: "Batch already has a class in this time slot",
                conflict: batchConflict,
            });
        }

        const tutorSlots = await Timetable.find({
            tutor,
            day,
            isDeleted: false,
        }).populate("batch", "name startDate endDate status");

        const tutorConflict = tutorSlots.find((s) =>
            isOverlap(s.startMinutes, s.endMinutes, startMinutes, endMinutes)
        );

        if (tutorConflict) {
            return res.status(400).json({
                message: "Tutor is already assigned in another batch at this time",
                conflict: tutorConflict,
            });
        }

        if (room && room.trim()) {
            const roomSlots = await Timetable.find({
                room: room.trim(),
                day,
                isDeleted: false,
            });

            const roomConflict = roomSlots.find((s) =>
                isOverlap(s.startMinutes, s.endMinutes, startMinutes, endMinutes)
            );

            if (roomConflict) {
                return res.status(400).json({
                    message: "Room is already occupied at this time",
                    conflict: roomConflict,
                });
            }
        }

        const slot = await Timetable.create({
            batch,
            tutor,
            course,
            subject: subject || "",
            day,
            startMinutes,
            endMinutes,
            room: room || "",
        });

        const populated = await Timetable.findById(slot._id)
            .populate("batch", "name startDate endDate status isActive")
            .populate("tutor", "name email")
            .populate("course", "title category level");

        return res.status(201).json({
            message: "Slot created successfully",
            slot: populated,
        });
    } catch (error) {
        console.error("Create slot error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getBatchTimetable = async (req, res) => {
    try {
        const { batchId } = req.params;

        const slots = await Timetable.find({
            batch: batchId,
            isDeleted: false,
        })
            .sort({ day: 1, startMinutes: 1 })
            .populate("batch", "name startDate endDate status isActive")
            .populate("tutor", "name email")
            .populate("course", "title category level");

        return res.status(200).json({ slots });
    } catch (error) {
        console.error("Get batch timetable error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateSlot = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await Timetable.findOne({ _id: id, isDeleted: false });
        if (!existing) return res.status(404).json({ message: "Slot not found" });

        const next = {
            batch: req.body.batch ?? existing.batch,
            tutor: req.body.tutor ?? existing.tutor,
            course: req.body.course ?? existing.course,
            subject: req.body.subject ?? existing.subject,
            day: req.body.day ?? existing.day,
            startMinutes: req.body.startMinutes ?? existing.startMinutes,
            endMinutes: req.body.endMinutes ?? existing.endMinutes,
            room: req.body.room ?? existing.room,
            note: req.body.note ?? existing.note,
        };

        if (next.startMinutes >= next.endMinutes) {
            return res.status(400).json({ message: "startMinutes must be < endMinutes" });
        }

        const batchDoc = await Batch.findOne({ _id: next.batch, isDeleted: false });
        if (!batchDoc) return res.status(404).json({ message: "Batch not found" });

        const tutorDoc = await Tutor.findOne({ _id: next.tutor, isDeleted: false });
        if (!tutorDoc) return res.status(404).json({ message: "Tutor not found" });

        const courseDoc = await Course.findOne({ _id: next.course, isDeleted: false });
        if (!courseDoc) return res.status(404).json({ message: "Course not found" });

        const batchSlots = await Timetable.find({
            _id: { $ne: id },
            batch: next.batch,
            day: next.day,
            isDeleted: false,
        });

        const batchConflict = batchSlots.find((s) =>
            isOverlap(s.startMinutes, s.endMinutes, next.startMinutes, next.endMinutes)
        );

        if (batchConflict) {
            return res.status(400).json({
                message: "Batch already has a class in this time slot",
                conflict: batchConflict,
            });
        }

        const tutorSlots = await Timetable.find({
            _id: { $ne: id },
            tutor: next.tutor,
            day: next.day,
            isDeleted: false,
        }).populate("batch", "name startDate endDate status");

        const tutorConflict = tutorSlots.find((s) =>
            isOverlap(s.startMinutes, s.endMinutes, next.startMinutes, next.endMinutes)
        );

        if (tutorConflict) {
            return res.status(400).json({
                message: "Tutor is already assigned in another batch at this time",
                conflict: tutorConflict,
            });
        }

        if (next.room && next.room.trim()) {
            const roomSlots = await Timetable.find({
                _id: { $ne: id },
                room: next.room.trim(),
                day: next.day,
                isDeleted: false,
            });

            const roomConflict = roomSlots.find((s) =>
                isOverlap(s.startMinutes, s.endMinutes, next.startMinutes, next.endMinutes)
            );

            if (roomConflict) {
                return res.status(400).json({
                    message: "Room is already occupied at this time",
                    conflict: roomConflict,
                });
            }
        }

        const updated = await Timetable.findByIdAndUpdate(id, next, { new: true })
            .populate("batch", "name startDate endDate status isActive")
            .populate("tutor", "name email")
            .populate("course", "title category level");

        return res.status(200).json({
            message: "Slot updated successfully",
            slot: updated,
        });
    } catch (error) {
        console.error("Update slot error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;

        const slot = await Timetable.findOne({ _id: id, isDeleted: false });
        if (!slot) return res.status(404).json({ message: "Slot not found" });

        slot.isDeleted = true;
        slot.deletedAt = new Date();
        await slot.save();

        return res.status(200).json({ message: "Slot deleted successfully" });
    } catch (error) {
        console.error("Delete slot error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
