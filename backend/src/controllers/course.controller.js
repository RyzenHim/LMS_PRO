const Course = require("../models/course.model");

exports.allCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isDeleted: false })
            .populate("tutor", "name email")
            .populate("skills", "name description category")
            .sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            isDeleted: false
        })
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error("Get course by id error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            tutor,
            tutorName,
            price,
            duration,
            level,
            status,
            startDate,
            endDate,
            skills
        } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: "Title and category are required" });
        }

        const course = await Course.create({
            title,
            description,
            category,
            tutor,
            tutorName,
            price: price || 0,
            duration: duration || 0,
            level: level || "beginner",
            status: status || "draft",
            startDate,
            endDate,
            skills: skills || []
        });

        const populatedCourse = await Course.findById(course._id)
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        res.status(201).json({
            message: "Course added successfully",
            course: populatedCourse,
        });
    } catch (error) {
        console.error("Add course error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            category,
            tutor,
            tutorName,
            price,
            duration,
            level,
            status,
            startDate,
            endDate,
            studentsEnrolled,
            skills
        } = req.body;

        const course = await Course.findOne({ _id: id, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (title) course.title = title;
        if (description !== undefined) course.description = description;
        if (category) course.category = category;
        if (tutor) course.tutor = tutor;
        if (tutorName !== undefined) course.tutorName = tutorName;
        if (price !== undefined) course.price = price;
        if (duration !== undefined) course.duration = duration;
        if (level) course.level = level;
        if (status) course.status = status;
        if (startDate) course.startDate = startDate;
        if (endDate) course.endDate = endDate;
        if (studentsEnrolled !== undefined) course.studentsEnrolled = studentsEnrolled;
        if (skills !== undefined) course.skills = skills;

        await course.save();

        const populatedCourse = await Course.findById(course._id)
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        res.status(200).json({
            message: "Course updated successfully",
            course: populatedCourse,
        });
    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleCourseStatus = async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.isActive = !course.isActive;
        await course.save();

        res.status(200).json({
            message: "Course status updated",
            isActive: course.isActive,
        });
    } catch (error) {
        console.error("Toggle course status error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course moved to trash", course });
    } catch (error) {
        console.error("Soft delete course error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course restored successfully", course });
    } catch (error) {
        console.error("Restore course error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isDeleted: true })
            .populate("tutor", "name email")
            .populate("skills", "name description category")
            .sort({ deletedAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Get deleted courses error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

