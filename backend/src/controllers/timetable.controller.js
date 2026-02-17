const mongoose = require("mongoose");

const Timetable = require("../models/timetable.model");
const Batch = require("../models/batch.model");
const Tutor = require("../models/tutor.model");
const Course = require("../models/course.model");
const RoomUnit = require("../models/roomUnit.model");

const isOverlap = (existingStart, existingEnd, newStart, newEnd) => {
    return existingStart < newEnd && existingEnd > newStart;
};

exports.createSlot = async (req, res) => {
    try {
        const { batch, tutor, course, subject, day, startMinutes, endMinutes, room } =
            req.body;

        if (!batch || !tutor || !day) {
            return res.status(400).json({ message: "batch, tutor and day are required" });
        }

        if (startMinutes === undefined || endMinutes === undefined) {
            return res.status(400).json({ message: "startMinutes and endMinutes required" });
        }

        if (startMinutes >= endMinutes) {
            return res.status(400).json({ message: "startMinutes must be < endMinutes" });
        }

        if (!mongoose.Types.ObjectId.isValid(batch))
            return res.status(400).json({ message: "Invalid batch id" });

        if (!mongoose.Types.ObjectId.isValid(tutor))
            return res.status(400).json({ message: "Invalid tutor id" });

        if (course && !mongoose.Types.ObjectId.isValid(course))
            return res.status(400).json({ message: "Invalid course id" });

        if (room && !mongoose.Types.ObjectId.isValid(room))
            return res.status(400).json({ message: "Invalid room id" });

        const batchDoc = await Batch.findOne({ _id: batch, isDeleted: false });
        if (!batchDoc) return res.status(404).json({ message: "Batch not found" });

        const tutorDoc = await Tutor.findOne({ _id: tutor, isDeleted: false });
        if (!tutorDoc) return res.status(404).json({ message: "Tutor not found" });

        const finalCourseId = course || batchDoc.course;

        const courseDoc = await Course.findOne({
            _id: finalCourseId,
            isDeleted: false,
        });
        if (!courseDoc) return res.status(404).json({ message: "Course not found" });

        if (String(batchDoc.course) !== String(finalCourseId)) {
            return res.status(400).json({
                message: "Selected course does not belong to this batch",
            });
        }

        // validate room unit exists (if given)
        if (room) {
            const roomDoc = await RoomUnit.findOne({ _id: room, isDeleted: false });
            if (!roomDoc) return res.status(404).json({ message: "Room not found" });
        }


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

        if (room) {
            const roomSlots = await Timetable.find({
                room,
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
            course: finalCourseId,
            subject: subject || "",
            day,
            startMinutes,
            endMinutes,
            room: room || null,
        });

        const populated = await Timetable.findById(slot._id)
            .populate("batch", "name startDate endDate status isActive")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email phone",
                },
            })
            .populate("course", "title category level")
            .populate("room", "location buildingName floorNumber name");

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

        if (!mongoose.Types.ObjectId.isValid(batchId)) {
            return res.status(400).json({ message: "Invalid batch id" });
        }

        const slots = await Timetable.find({
            batch: batchId,
            isDeleted: false,
        })
            .sort({ day: 1, startMinutes: 1 })
            .populate("batch", "name startDate endDate status isActive")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email phone",
                },
            })
            .populate("course", "title category level")
            .populate("room", "location buildingName floorNumber name");

        return res.status(200).json({ slots });
    } catch (error) {
        console.error("Get batch timetable error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateSlot = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

        const existing = await Timetable.findOne({ _id: id, isDeleted: false });
        if (!existing) return res.status(404).json({ message: "Slot not found" });

        const next = {
            batch: req.body.batch ?? existing.batch,
            tutor: req.body.tutor ?? existing.tutor,
            subject: req.body.subject ?? existing.subject,
            day: req.body.day ?? existing.day,
            startMinutes: req.body.startMinutes ?? existing.startMinutes,
            endMinutes: req.body.endMinutes ?? existing.endMinutes,
            note: req.body.note ?? existing.note,

            room:
                req.body.room === "" || req.body.room === null || req.body.room === undefined
                    ? existing.room
                    : req.body.room,
        };

        if (!mongoose.Types.ObjectId.isValid(next.batch))
            return res.status(400).json({ message: "Invalid batch id" });

        if (!mongoose.Types.ObjectId.isValid(next.tutor))
            return res.status(400).json({ message: "Invalid tutor id" });

        if (next.room && !mongoose.Types.ObjectId.isValid(next.room))
            return res.status(400).json({ message: "Invalid room id" });

        const batchDoc = await Batch.findOne({ _id: next.batch, isDeleted: false });
        if (!batchDoc) return res.status(404).json({ message: "Batch not found" });

        next.course = batchDoc.course;

        if (next.startMinutes >= next.endMinutes) {
            return res.status(400).json({ message: "startMinutes must be < endMinutes" });
        }

        const tutorDoc = await Tutor.findOne({ _id: next.tutor, isDeleted: false });
        if (!tutorDoc) return res.status(404).json({ message: "Tutor not found" });

        const courseDoc = await Course.findOne({ _id: next.course, isDeleted: false });
        if (!courseDoc) return res.status(404).json({ message: "Course not found" });

        if (next.room) {
            const roomDoc = await RoomUnit.findOne({ _id: next.room, isDeleted: false });
            if (!roomDoc) return res.status(404).json({ message: "Room not found" });
        }


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

        if (next.room) {
            const roomSlots = await Timetable.find({
                _id: { $ne: id },
                room: next.room,
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
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email phone",
                },
            })
            .populate("course", "title category level")
            .populate("room", "location buildingName floorNumber name");

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid slot id" });
        }

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
