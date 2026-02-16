const Assignment = require("../models/assignment.model");
const Batch = require("../models/batch.model");
const BatchStudentMap = require("../models/batchStudentMap.model");

const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const search = (req.query.search || "").trim();
    return { page, limit, skip, sortBy, sortOrder, search };
};

const allowedSortFields = ["createdAt", "dueDate", "title", "status"];
const safeSort = (sortBy, sortOrder) => {
    const field = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    return { [field]: sortOrder };
};

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, batch, dueDate, status } = req.body;

        if (!title || !batch) {
            return res.status(400).json({ message: "title and batch are required" });
        }

        const batchDoc = await Batch.findOne({ _id: batch, isDeleted: false });
        if (!batchDoc) return res.status(404).json({ message: "Batch not found" });

        if (req.user.role === "tutor" && String(batchDoc.tutor) !== String(req.user.tutor)) {
            return res.status(403).json({ message: "You can create assignment only for your batches" });
        }

        const tutorId = req.user.role === "tutor" ? req.user.tutor : batchDoc.tutor;

        const assignment = await Assignment.create({
            title: String(title).trim(),
            description: description || "",
            batch: batchDoc._id,
            course: batchDoc.course,
            tutor: tutorId,
            dueDate: dueDate || null,
            status: status || "published",
        });

        const populated = await Assignment.findById(assignment._id)
            .populate("batch", "name status")
            .populate("course", "title category level")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email",
                },
            });

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment: populated,
        });
    } catch (error) {
        console.error("createAssignment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getMyAssignments = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const { status, batch, from, to, tutor } = req.query;

        const filter = {
            isDeleted: false,
            ...(status ? { status } : {}),
            ...(batch ? { batch } : {}),
        };

        if (req.user.role === "tutor") {
            filter.tutor = req.user.tutor;
        } else if (tutor) {
            filter.tutor = tutor;
        }

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const totalAssignments = await Assignment.countDocuments(filter);
        const assignments = await Assignment.find(filter)
            .sort(safeSort(sortBy, sortOrder))
            .skip(skip)
            .limit(limit)
            .populate("batch", "name status")
            .populate("course", "title category level")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email",
                },
            })
            .lean();

        return res.status(200).json({
            assignments,
            totalAssignments,
            page,
            limit,
            totalPages: Math.ceil(totalAssignments / limit),
        });
    } catch (error) {
        console.error("getMyAssignments error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getStudentAssignments = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const { status, from, to } = req.query;

        const studentId = req.user?.student;
        if (!studentId) {
            return res.status(404).json({ message: "Student profile not found" });
        }

        const activeMappings = await BatchStudentMap.find({
            student: studentId,
            status: "active",
            isDeleted: false,
        }).select("batch");

        const batchIds = activeMappings.map((m) => m.batch);
        if (batchIds.length === 0) {
            return res.status(200).json({
                assignments: [],
                totalAssignments: 0,
                page,
                limit,
                totalPages: 0,
            });
        }

        const filter = {
            isDeleted: false,
            batch: { $in: batchIds },
            ...(status ? { status } : {}),
        };

        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const totalAssignments = await Assignment.countDocuments(filter);
        const assignments = await Assignment.find(filter)
            .sort(safeSort(sortBy, sortOrder))
            .skip(skip)
            .limit(limit)
            .populate("batch", "name status")
            .populate("course", "title category level")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email",
                },
            })
            .lean();

        return res.status(200).json({
            assignments,
            totalAssignments,
            page,
            limit,
            totalPages: Math.ceil(totalAssignments / limit),
        });
    } catch (error) {
        console.error("getStudentAssignments error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, dueDate, status } = req.body;

        const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        if (req.user.role === "tutor" && String(assignment.tutor) !== String(req.user.tutor)) {
            return res.status(403).json({ message: "You can update only your assignment" });
        }

        if (title !== undefined) assignment.title = title;
        if (description !== undefined) assignment.description = description;
        if (dueDate !== undefined) assignment.dueDate = dueDate || null;
        if (status !== undefined) assignment.status = status;

        await assignment.save();

        const populated = await Assignment.findById(assignment._id)
            .populate("batch", "name status")
            .populate("course", "title category level")
            .populate({
                path: "tutor",
                populate: {
                    path: "employee",
                    select: "name email",
                },
            });

        return res.status(200).json({
            message: "Assignment updated successfully",
            assignment: populated,
        });
    } catch (error) {
        console.error("updateAssignment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, isDeleted: false });
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        if (req.user.role === "tutor" && String(assignment.tutor) !== String(req.user.tutor)) {
            return res.status(403).json({ message: "You can delete only your assignment" });
        }

        assignment.isDeleted = true;
        assignment.deletedAt = new Date();
        await assignment.save();

        return res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("softDeleteAssignment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ _id: req.params.id, isDeleted: true });
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });

        assignment.isDeleted = false;
        assignment.deletedAt = null;
        await assignment.save();

        return res.status(200).json({ message: "Assignment restored successfully" });
    } catch (error) {
        console.error("restoreAssignment error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
