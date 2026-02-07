const Tutor = require("../models/tutor.model");

exports.allTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find({ isDeleted: false }).sort({ createdAt: -1 });
        const totalTutors = await Tutor.countDocuments()
        res.status(200).json({ tutors, totalTutors });
    } catch (error) {
        console.error("Get tutors error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getTutorById = async (req, res) => {
    try {
        const tutor = await Tutor.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        res.status(200).json(tutor);
    } catch (error) {
        console.error("Get tutor by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addTutor = async (req, res) => {
    try {
        const { name, email, phone, expertise, experience, qualification, bio, salary } = req.body;

        if (!name || !email || !expertise) {
            return res.status(400).json({ message: "Name, email, and expertise are required" });
        }

        const exists = await Tutor.findOne({ email, isDeleted: false });
        if (exists) {
            return res.status(400).json({ message: "Tutor already exists" });
        }

        const tutor = await Tutor.create({
            name,
            email,
            phone,
            expertise,
            experience: experience || 0,
            qualification,
            bio,
            salary: salary || 0
        });

        res.status(201).json({
            message: "Tutor added successfully",
            tutor,
        });
    } catch (error) {
        console.error("Add tutor error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateTutor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, expertise, experience, qualification, bio, salary } = req.body;

        const tutor = await Tutor.findOne({ _id: id, isDeleted: false });
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        if (name) tutor.name = name;
        if (email) tutor.email = email;
        if (phone !== undefined) tutor.phone = phone;
        if (expertise) tutor.expertise = expertise;
        if (experience !== undefined) tutor.experience = experience;
        if (qualification !== undefined) tutor.qualification = qualification;
        if (bio !== undefined) tutor.bio = bio;
        if (salary !== undefined) tutor.salary = salary;

        await tutor.save();

        res.status(200).json({
            message: "Tutor updated successfully",
            tutor,
        });
    } catch (error) {
        console.error("Update tutor error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleTutorStatus = async (req, res) => {
    try {
        const tutor = await Tutor.findOne({ _id: req.params.id, isDeleted: false });
        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        tutor.isActive = !tutor.isActive;
        await tutor.save();

        res.status(200).json({
            message: "Tutor status updated",
            isActive: tutor.isActive,
        });
    } catch (error) {
        console.error("Toggle tutor status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        res.status(200).json({ message: "Tutor moved to trash", tutor });
    } catch (error) {
        console.error("Soft delete tutor error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreTutor = async (req, res) => {
    try {
        const tutor = await Tutor.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        res.status(200).json({ message: "Tutor restored successfully", tutor });
    } catch (error) {
        console.error("Restore tutor error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedTutors = async (req, res) => {
    try {
        const tutors = await Tutor.find({ isDeleted: true })
            .sort({ deletedAt: -1 });
        res.status(200).json(tutors);
    } catch (error) {
        console.error("Get deleted tutors error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
