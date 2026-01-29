const Visitor = require("../models/visitor.model");
const Employee = require("../models/employee.model")


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
            ...req.body

            // createdBy: req.user._id,
        });

        res.status(201).json(visitor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({ isDeleted: false })
            .sort({ createdAt: -1 });

        return res.status(200).json(visitors);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

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

exports.restoreVisitor = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(500).json({ message: "internal server error" });

    }
};

exports.getDeletedVisitors = async (req, res) => {
    const visitors = await Visitor.find({ isDeleted: true })
        .sort({ deletedAt: -1 });

    res.json(visitors);
};



exports.convertToStudent = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        if (visitor.status === "converted") {
            return res.status(400).json({ message: "Already converted" });
        }

        const student = await Employee.create({
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone,
            course: visitor.course,
            joinedFromVisitor: visitor._id,
        });

        visitor.status = "converted";
        visitor.studentId = student._id;
        await visitor.save();

        res.json({ visitor, student });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};