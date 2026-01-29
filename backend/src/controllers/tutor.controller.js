const Tutor = require("../models/employee.model");

exports.allTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find();
        res.status(200).json(tutors);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addTutor = async (req, res) => {
    try {
        const { name, email, expertise, experience } = req.body;

        if (!name || !email || !expertise) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await Tutor.findOne({ email });
        if (exists) {
            return res.status(400).json({ message: "Tutor already exists" });
        }

        const tutor = await Tutor.create({
            name,
            email,
            expertise,
            experience,
        });

        res.status(201).json({
            message: "Tutor added successfully",
            tutor,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const { name, email, expertise, experience } = req.body;

        if (name) tutor.name = name;
        if (email) tutor.email = email;
        if (expertise) tutor.expertise = expertise;
        if (experience !== undefined) tutor.experience = experience;

        await tutor.save();

        res.status(200).json({
            message: "Tutor updated",
            tutor,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleTutorStatus = async (req, res) => {
    try {
        const tutor = await Tutor.findById(req.params.id);
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        tutor.isActive = !tutor.isActive;
        await tutor.save();

        res.status(200).json({
            message: "Tutor status updated",
            isActive: tutor.isActive,
        });
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};
