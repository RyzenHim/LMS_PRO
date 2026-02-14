const Course = require("../models/course.model");

const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const search = (req.query.search || "").trim();
    return { page, limit, skip, sortBy, sortOrder, search };
};

exports.allCourses = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const searchQuery = search
            ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } },
                    { level: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: false, ...searchQuery };

        const totalCourses = await Course.countDocuments(filter);

        const courses = await Course.find(filter)
            .populate("tutor", "name email")
            .populate("skills", "name description category")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            courses,
            totalCourses,
            page,
            limit,
            totalPages: Math.ceil(totalCourses / limit),
        });
    } catch (error) {
        console.error("Get courses error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            isDeleted: false,
        })
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json(course);
    } catch (error) {
        console.error("Get course by id error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            tutor,
            price,
            duration,
            level,
            status,
            startDate,
            endDate,
            skills,
        } = req.body;

        if (!title || !category) {
            return res.status(400).json({ message: "Title and category are required" });
        }

        if (price === undefined || Number(price) <= 0) {
            return res
                .status(400)
                .json({ message: "Course price is required and must be greater than 0" });
        }

        const tutorArray =
            tutor === undefined || tutor === null
                ? []
                : Array.isArray(tutor)
                    ? tutor
                    : [tutor];

        const skillsArray =
            skills === undefined || skills === null
                ? []
                : Array.isArray(skills)
                    ? skills
                    : [skills];

        const course = await Course.create({
            title,
            description,
            category,
            tutor: tutorArray,
            price: Number(price),
            duration: duration || 0,
            level: level || "beginner",
            status: status || "draft",
            startDate: startDate || null,
            endDate: endDate || null,
            skills: skillsArray,
        });

        const populatedCourse = await Course.findById(course._id)
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        return res.status(201).json({
            message: "Course added successfully",
            course: populatedCourse,
        });
    } catch (error) {
        console.error("Add course error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findOne({ _id: id, isDeleted: false });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const {
            title,
            description,
            category,
            tutor,
            price,
            duration,
            level,
            status,
            startDate,
            endDate,
            studentsEnrolled,
            skills,
        } = req.body;

        if (title !== undefined) course.title = title;
        if (description !== undefined) course.description = description;
        if (category !== undefined) course.category = category;

        if (tutor !== undefined) {
            course.tutor =
                tutor === null ? [] : Array.isArray(tutor) ? tutor : [tutor];
        }

        if (price !== undefined) {
            if (Number(price) <= 0) {
                return res.status(400).json({ message: "Course price must be greater than 0" });
            }
            course.price = Number(price);
        }

        if (duration !== undefined) course.duration = Number(duration || 0);
        if (level !== undefined) course.level = level;
        if (status !== undefined) course.status = status;
        if (startDate !== undefined) course.startDate = startDate || null;
        if (endDate !== undefined) course.endDate = endDate || null;

        if (studentsEnrolled !== undefined) {
            course.studentsEnrolled = Number(studentsEnrolled || 0);
        }

        if (skills !== undefined) {
            course.skills =
                skills === null ? [] : Array.isArray(skills) ? skills : [skills];
        }

        await course.save();

        const populatedCourse = await Course.findById(course._id)
            .populate("tutor", "name email")
            .populate("skills", "name description category");

        return res.status(200).json({
            message: "Course updated successfully",
            course: populatedCourse,
        });
    } catch (error) {
        console.error("Update course error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.toggleCourseStatus = async (req, res) => {
    try {
        const course = await Course.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.isActive = !course.isActive;
        await course.save();

        return res.status(200).json({
            message: "Course status updated",
            isActive: course.isActive,
        });
    } catch (error) {
        console.error("Toggle course status error:", error);
        return res.status(500).json({ message: "Internal server error" });
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

        return res.status(200).json({ message: "Course moved to trash", course });
    } catch (error) {
        console.error("Soft delete course error:", error);
        return res.status(500).json({ message: "Internal server error" });
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

        return res.status(200).json({ message: "Course restored successfully", course });
    } catch (error) {
        console.error("Restore course error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedCourses = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const searchQuery = search
            ? {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { category: { $regex: search, $options: "i" } },
                    { level: { $regex: search, $options: "i" } },
                    { status: { $regex: search, $options: "i" } },
                ],
            }
            : {};

        const filter = { isDeleted: true, ...searchQuery };

        const totalCourses = await Course.countDocuments(filter);

        const courses = await Course.find(filter)
            .populate("tutor", "name email")
            .populate("skills", "name description category")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            courses,
            totalCourses,
            page,
            limit,
            totalPages: Math.ceil(totalCourses / limit),
        });
    } catch (error) {
        console.error("Get deleted courses error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
