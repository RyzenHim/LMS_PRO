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
exports.getAllBatches = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: false, ...searchQuery };
        const totalBatches = await Batch.countDocuments(filter);
        const batches = await Batch.find(filter)
            .populate("course", "title category level")
            .populate("tutor", "name email")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            batches,
            totalBatches,
            page,
            limit,
            totalPages: Math.ceil(totalBatches / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getDeletedBatches = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: true, ...searchQuery };
        const totalBatches = await Batch.countDocuments(filter);
        const deleted = await Batch.find(filter)
            .populate("course", "title category level")
            .populate("tutor", "name email")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            batches: deleted,
            totalBatches,
            page,
            limit,
            totalPages: Math.ceil(totalBatches / limit),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createBatch = async (req, res) => {
    try {
        const { name, course, tutor, startDate, endDate, status } = req.body;

        if (!name || !course || !tutor || !startDate) {
            return res.status(400).json({ message: "All required fields must be filled" });
        }

        const batch = await Batch.create({
            name,
            course,
            tutor,
            startDate,
            endDate: endDate || null,
            status: status || "upcoming",
        });

        const populatedBatch = await Batch.findById(batch._id)
            .populate("course", "title category level")
            .populate("tutor", "name email");

        return res.status(201).json({
            message: "Batch created successfully",
            batch: populatedBatch,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.updateBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Batch.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        )
            .populate("course", "title category level")
            .populate("tutor", "name email");

        if (!updated) {
            return res.status(404).json({ message: "Batch not found" });
        }

        return res.status(200).json({
            message: "Batch updated successfully",
            batch: updated,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.softDeleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findById(id);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        batch.isDeleted = true;
        batch.deletedAt = new Date();
        await batch.save();

        return res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.restoreBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findById(id);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        batch.isDeleted = false;
        batch.deletedAt = null;
        await batch.save();

        return res.status(200).json({ message: "Batch restored successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.toggleBatchStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findById(id);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        batch.isActive = !batch.isActive;
        await batch.save();

        return res.status(200).json({
            message: "Batch status updated successfully",
            isActive: batch.isActive,
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.allBatchesWithCount = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: false, ...searchQuery };
        const totalBatches = await Batch.countDocuments(filter);
        const batches = await Batch.find(filter)
            .populate("course", "title")
            .populate("tutor", "name")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean();

        const batchIds = batches.map((b) => b._id);

        // count students for each batch
        const counts = await BatchStudentMap.aggregate([
            {
                $match: {
                    batch: { $in: batchIds },
                    status: "active",
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: "$batch",
                    count: { $sum: 1 },
                },
            },
        ]);

        const countMap = {};
        counts.forEach((c) => {
            countMap[c._id.toString()] = c.count;
        });

        const final = batches.map((b) => ({
            ...b,
            studentsCount: countMap[b._id.toString()] || 0,
        }));

        return res.status(200).json({
            batches: final,
            totalBatches,
            page,
            limit,
            totalPages: Math.ceil(totalBatches / limit),
        });
    } catch (error) {
        console.error("allBatchesWithCount error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
