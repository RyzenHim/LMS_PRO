const Visitor = require("../models/visotor.model");

/* ---------------- CREATE ---------------- */
exports.createVisitor = async (req, res) => {
    try {
        const { name, email, phone, source, note, course, status, createdBy } = req.body
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email is required" })
        }
        const existing = await Visitor.findOne({ email })
        if (existing) {
            return res.status(400).json({ message: "User already exist" })
        }


        const visitor = await Visitor.create({
            ...req.body,
            createdBy: req.user._id,
        });

        res.status(201).json(visitor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* ---------------- READ ALL ---------------- */
exports.getVisitors = async (req, res) => {
    const visitors = await Visitor.find({ isDeleted: false })
        .sort({ createdAt: -1 });

    res.json(visitors);
};

/* ---------------- READ ONE ---------------- */
exports.getVisitorById = async (req, res) => {
    const visitor = await Visitor.findOne({
        _id: req.params.id,
        isDeleted: false,
    });

    if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
};

/* ---------------- UPDATE ---------------- */
exports.updateVisitor = async (req, res) => {
    const visitor = await Visitor.findOneAndUpdate(
        { _id: req.params.id, isDeleted: false },
        req.body,
        { new: true, runValidators: true }
    );

    if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
};

/* ---------------- SOFT DELETE ---------------- */
exports.softDeleteVisitor = async (req, res) => {
    const visitor = await Visitor.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: true,
            deletedAt: new Date(),
        },
        { new: true }
    );

    if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    res.json({ message: "Visitor moved to trash" });
};

/* ---------------- RESTORE ---------------- */
exports.restoreVisitor = async (req, res) => {
    const visitor = await Visitor.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: false,
            deletedAt: null,
        },
        { new: true }
    );

    if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
    }

    res.json(visitor);
};

/* ---------------- TRASH LIST ---------------- */
exports.getDeletedVisitors = async (req, res) => {
    const visitors = await Visitor.find({ isDeleted: true })
        .sort({ deletedAt: -1 });

    res.json(visitors);
};
