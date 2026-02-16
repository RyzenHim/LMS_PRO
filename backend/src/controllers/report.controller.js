const Student = require("../models/student.model");
const Batch = require("../models/batch.model");
const BatchStudentMap = require("../models/batchStudentMap.model");
const Course = require("../models/course.model");
const Fees = require("../models/fees.model");
const Tutor = require("../models/tutor.model");
const Employee = require("../models/employee.model");
const Skill = require("../models/skill.model");
const Timetable = require("../models/timetable.model");
const Visitor = require("../models/visitor.model");

const buildDateFilter = (field, from, to) => {
    if (!from && !to) return {};
    const dateFilter = {};
    if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
            dateFilter.$gte = fromDate;
        }
    }
    if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
            if (typeof to === "string" && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
                toDate.setHours(23, 59, 59, 999);
            }
            dateFilter.$lte = toDate;
        }
    }
    if (!Object.keys(dateFilter).length) return {};
    return { [field]: dateFilter };
};

exports.studentReport = async (req, res) => {
    try {
        const { course, batch, status, from, to, search } = req.query;

        const studentFilter = {
            isDeleted: false,
            ...(status ? { status } : {}),
            ...buildDateFilter("createdAt", from, to),
        };

        const students = await Student.find(studentFilter)
            .populate({
                path: "visitor",
                select: "name email phone course",
                match: {
                    ...(course ? { course } : {}),
                    ...(search
                        ? {
                            $or: [
                                { name: { $regex: search, $options: "i" } },
                                { email: { $regex: search, $options: "i" } },
                                { phone: { $regex: search, $options: "i" } },
                            ],
                        }
                        : {}),
                },
                populate: { path: "course", select: "title category level price" },
            })
            .sort({ createdAt: -1 })
            .lean();

        let filtered = students.filter((s) => s.visitor);

        const allMappings = await BatchStudentMap.find({
            student: { $in: filtered.map((s) => s._id) },
            status: "active",
            isDeleted: false,
        })
            .populate("batch", "name status")
            .lean();

        const mappingMap = new Map();
        allMappings.forEach((m) => {
            mappingMap.set(String(m.student), m.batch || null);
        });

        filtered = filtered.map((s) => ({
            ...s,
            batch: mappingMap.get(String(s._id)) || null,
        }));

        if (batch) {
            const ids = filtered.map((s) => s._id);
            const maps = await BatchStudentMap.find({
                student: { $in: ids },
                batch,
                status: "active",
                isDeleted: false,
            }).select("student");

            const set = new Set(maps.map((m) => String(m.student)));
            filtered = filtered.filter((s) => set.has(String(s._id)));
        }

        return res.status(200).json({ students: filtered, total: filtered.length });
    } catch (error) {
        console.error("studentReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.batchReport = async (req, res) => {
    try {
        const { course, batch, from, to, search } = req.query;

        const filter = {
            isDeleted: false,
            status: "active",
            ...(course ? { course } : {}),
            ...(batch ? { batch } : {}),
            ...buildDateFilter("createdAt", from, to),
        };

        const mappings = await BatchStudentMap.find(filter)
            .populate("batch", "name status")
            .populate("course", "title category level")
            .populate({
                path: "student",
                select: "status",
                populate: { path: "visitor", select: "name email phone" },
            })
            .sort({ createdAt: -1 })
            .lean();

        const rows = mappings.filter((m) => {
            if (!search) return true;
            const q = search.toLowerCase();
            const name = m?.student?.visitor?.name?.toLowerCase() || "";
            const email = m?.student?.visitor?.email?.toLowerCase() || "";
            return name.includes(q) || email.includes(q);
        });

        return res.status(200).json({ mappings: rows, total: rows.length });
    } catch (error) {
        console.error("batchReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.courseReport = async (req, res) => {
    try {
        const { status, from, to, search } = req.query;

        const filter = {
            isDeleted: false,
            ...(status ? { status } : {}),
            ...buildDateFilter("createdAt", from, to),
            ...(search
                ? {
                    $or: [
                        { title: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                    ],
                }
                : {}),
        };

        const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
        const batches = await Batch.find({ isDeleted: false }).select("course").lean();
        const countMap = {};
        batches.forEach((b) => {
            const key = String(b.course);
            countMap[key] = (countMap[key] || 0) + 1;
        });

        const rows = courses.map((c) => ({
            ...c,
            batchCount: countMap[String(c._id)] || 0,
        }));

        return res.status(200).json({ courses: rows, total: rows.length });
    } catch (error) {
        console.error("courseReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.feesReport = async (req, res) => {
    try {
        const { status, paymentMode, paymentType, from, to, search } = req.query;

        const filter = {
            isDeleted: false,
            ...(status ? { status } : {}),
            ...(paymentMode ? { paymentMode } : {}),
            ...(paymentType ? { paymentType } : {}),
            ...buildDateFilter("createdAt", from, to),
        };

        const fees = await Fees.find(filter)
            .populate({
                path: "student",
                select: "status",
                populate: { path: "visitor", select: "name email phone" },
            })
            .populate("course", "title price")
            .sort({ createdAt: -1 })
            .lean();

        const rows = fees.filter((f) => {
            if (!search) return true;
            const q = search.toLowerCase();
            const name = f?.student?.visitor?.name?.toLowerCase() || "";
            const email = f?.student?.visitor?.email?.toLowerCase() || "";
            return name.includes(q) || email.includes(q);
        });

        return res.status(200).json({ fees: rows, total: rows.length });
    } catch (error) {
        console.error("feesReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.tutorReport = async (req, res) => {
    try {
        const { from, to, search, isActive } = req.query;

        const filter = {
            isDeleted: false,
            ...buildDateFilter("createdAt", from, to),
        };

        if (isActive === "true") filter.isActive = true;
        if (isActive === "false") filter.isActive = false;

        const tutors = await Tutor.find(filter)
            .populate("employee", "name email phone department designation")
            .sort({ createdAt: -1 })
            .lean();

        const rows = tutors.filter((t) => {
            if (!search) return true;
            const q = search.toLowerCase();
            const name = t?.employee?.name?.toLowerCase() || "";
            const email = t?.employee?.email?.toLowerCase() || "";
            return name.includes(q) || email.includes(q);
        });

        return res.status(200).json({ tutors: rows, total: rows.length });
    } catch (error) {
        console.error("tutorReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.employeeReport = async (req, res) => {
    try {
        const { from, to, search, isActive, department, designation } = req.query;

        const filter = {
            isDeleted: false,
            ...buildDateFilter("createdAt", from, to),
            ...(department ? { department: { $regex: department, $options: "i" } } : {}),
            ...(designation ? { designation: { $regex: designation, $options: "i" } } : {}),
            ...(search
                ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { department: { $regex: search, $options: "i" } },
                    ],
                }
                : {}),
        };

        if (isActive === "true") filter.isActive = true;
        if (isActive === "false") filter.isActive = false;

        const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();

        return res.status(200).json({ employees, total: employees.length });
    } catch (error) {
        console.error("employeeReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.skillReport = async (req, res) => {
    try {
        const { from, to, search, isActive, category } = req.query;

        const filter = {
            isDeleted: false,
            ...buildDateFilter("createdAt", from, to),
            ...(category ? { category: { $regex: category, $options: "i" } } : {}),
            ...(search
                ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { category: { $regex: search, $options: "i" } },
                    ],
                }
                : {}),
        };

        if (isActive === "true") filter.isActive = true;
        if (isActive === "false") filter.isActive = false;

        const skills = await Skill.find(filter).sort({ createdAt: -1 }).lean();
        return res.status(200).json({ skills, total: skills.length });
    } catch (error) {
        console.error("skillReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.timetableReport = async (req, res) => {
    try {
        const { batch, tutor, course, day, from, to } = req.query;

        const filter = {
            isDeleted: false,
            ...(batch ? { batch } : {}),
            ...(tutor ? { tutor } : {}),
            ...(course ? { course } : {}),
            ...(day ? { day } : {}),
            ...buildDateFilter("createdAt", from, to),
        };

        const slots = await Timetable.find(filter)
            .populate("batch", "name")
            .populate({
                path: "tutor",
                populate: { path: "employee", select: "name email" },
            })
            .populate("course", "title")
            .sort({ day: 1, startMinutes: 1 })
            .lean();

        return res.status(200).json({ slots, total: slots.length });
    } catch (error) {
        console.error("timetableReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.visitorReport = async (req, res) => {
    try {
        const { status, from, to, search, course } = req.query;

        const filter = {
            isDeleted: false,
            ...(status ? { status } : {}),
            ...(course ? { course } : {}),
            ...buildDateFilter("createdAt", from, to),
            ...(search
                ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { phone: { $regex: search, $options: "i" } },
                    ],
                }
                : {}),
        };

        const visitors = await Visitor.find(filter)
            .populate("course", "title category")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ visitors, total: visitors.length });
    } catch (error) {
        console.error("visitorReport error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
