const Skill = require("../models/skill.model");

exports.allSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ isDeleted: false }).sort({ name: 1 });
        res.status(200).json(skills);
    } catch (error) {
        console.error("Get skills error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.status(200).json(skill);
    } catch (error) {
        console.error("Get skill by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addSkill = async (req, res) => {
    try {
        const { name, description, category } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Skill name is required" });
        }

        const existingSkill = await Skill.findOne({ 
            name: name.toLowerCase().trim(),
            isDeleted: false 
        });
        if (existingSkill) {
            return res.status(400).json({ message: "Skill already exists" });
        }

        const skill = await Skill.create({
            name: name.toLowerCase().trim(),
            description,
            category
        });

        res.status(201).json({
            message: "Skill added successfully",
            skill,
        });
    } catch (error) {
        console.error("Add skill error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category } = req.body;

        const skill = await Skill.findOne({ _id: id, isDeleted: false });
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        if (name) {
            const existingSkill = await Skill.findOne({ 
                name: name.toLowerCase().trim(),
                _id: { $ne: id },
                isDeleted: false 
            });
            if (existingSkill) {
                return res.status(400).json({ message: "Skill name already exists" });
            }
            skill.name = name.toLowerCase().trim();
        }
        if (description !== undefined) skill.description = description;
        if (category !== undefined) skill.category = category;

        await skill.save();

        res.status(200).json({
            message: "Skill updated successfully",
            skill,
        });
    } catch (error) {
        console.error("Update skill error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleSkillStatus = async (req, res) => {
    try {
        const skill = await Skill.findOne({ _id: req.params.id, isDeleted: false });
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        skill.isActive = !skill.isActive;
        await skill.save();

        res.status(200).json({
            message: "Skill status updated",
            isActive: skill.isActive,
        });
    } catch (error) {
        console.error("Toggle skill status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.status(200).json({ message: "Skill moved to trash", skill });
    } catch (error) {
        console.error("Soft delete skill error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        res.status(200).json({ message: "Skill restored successfully", skill });
    } catch (error) {
        console.error("Restore skill error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedSkills = async (req, res) => {
    try {
        const skills = await Skill.find({ isDeleted: true })
            .sort({ deletedAt: -1 });
        res.status(200).json(skills);
    } catch (error) {
        console.error("Get deleted skills error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
