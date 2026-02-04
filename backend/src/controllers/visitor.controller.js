const Visitor = require("../models/visitor.model");
const Student = require("../models/student.model");
const Tutor = require("../models/tutor.model");
const Employee = require("../models/employee.model");
const User = require("../models/authUsers.model");

exports.createVisitor = async (req, res) => {
    try {
        const { name, email, phone, source, note, course, status, createdBy } = req.body
        if (!name) {
            return res.status(400).json({ message: "Name is required" })
        }

        if (email) {
            const existing = await Visitor.findOne({ email, isDeleted: false })
            if (existing) {
                return res.status(400).json({ message: "Visitor with this email already exists" })
            }
        }

        const visitor = await Visitor.create({
            ...req.body
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
    try {
        const visitor = await Visitor.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        res.json(visitor);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateVisitor = async (req, res) => {
    try {
        const visitor = await Visitor.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        res.json(visitor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.softDeleteVisitor = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
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
    try {
        const visitors = await Visitor.find({ isDeleted: true })
            .sort({ deletedAt: -1 });

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getNotInterestedVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({
            isDeleted: false,
            status: "not-interested"
        })
            .sort({ updatedAt: -1 });

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getFollowUpVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({
            isDeleted: false,
            status: "follow-up",
            followUpDate: { $lte: new Date() } // Only those whose follow-up date has passed
        })
            .sort({ followUpDate: 1 });

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getConvertedVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.find({
            isDeleted: false,
            status: "converted"
        })
            .sort({ updatedAt: -1 });

        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.markNotInterested = async (req, res) => {
    try {
        const { id } = req.params;
        const { notInterestedReason, followUpDate } = req.body;

        const visitor = await Visitor.findById(id);
        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        visitor.status = "not-interested";
        if (notInterestedReason) visitor.notInterestedReason = notInterestedReason;
        if (followUpDate) visitor.followUpDate = followUpDate;

        await visitor.save();

        res.json({ message: "Visitor marked as not interested", visitor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.convertToStudent = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        if (visitor.status === "converted") {
            return res.status(400).json({ message: "Visitor already converted" });
        }

        if (!visitor.email) {
            return res.status(400).json({ message: "Email is required for conversion" });
        }

        const existingStudent = await Student.findOne({ email: visitor.email, isDeleted: false });
        if (existingStudent) {
            return res.status(400).json({ message: "Student with this email already exists" });
        }

        const student = await Student.create({
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone?.toString(),
            course: visitor.course,
        });

        const defaultPassword = "Password@123";
        const user = await User.create({
            name: visitor.name,
            email: visitor.email,
            password: defaultPassword,
            role: "student"
        });

        visitor.status = "converted";
        visitor.conversionType = "student";
        visitor.convertedToId = student._id;
        await visitor.save();

        res.json({
            message: "Visitor converted to student successfully",
            visitor,
            student,
            user: { email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Convert to student error:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.convertToTutor = async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        if (visitor.status === "converted") {
            return res.status(400).json({ message: "Visitor already converted" });
        }

        if (!visitor.email) {
            return res.status(400).json({ message: "Email is required for conversion" });
        }

        const existingTutor = await Tutor.findOne({ email: visitor.email, isDeleted: false });
        if (existingTutor) {
            return res.status(400).json({ message: "Tutor with this email already exists" });
        }

        const tutor = await Tutor.create({
            name: visitor.name,
            email: visitor.email,
            phone: visitor.phone?.toString(),
            expertise: visitor.course || "General",
        });

        const defaultPassword = "Password@123";
        const user = await User.create({
            name: visitor.name,
            email: visitor.email,
            password: defaultPassword,
            role: "instructor"
        });

        visitor.status = "converted";
        visitor.conversionType = "tutor";
        visitor.convertedToId = tutor._id;
        await visitor.save();

        res.json({
            message: "Visitor converted to tutor successfully",
            visitor,
            tutor,
            user: { email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Convert to tutor error:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.convertToEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { department, designation, salary } = req.body;

        const visitor = await Visitor.findById(id);

        if (!visitor) {
            return res.status(404).json({ message: "Visitor not found" });
        }

        if (visitor.status === "converted") {
            return res.status(400).json({ message: "Visitor already converted" });
        }

        if (!visitor.email) {
            return res.status(400).json({ message: "Email is required for conversion" });
        }

        if (!department || !designation) {
            return res.status(400).json({ message: "Department and designation are required" });
        }

        const existingEmployee = await Employee.findOne({ email: visitor.email, isDeleted: false });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee with this email already exists" });
        }

        const employee = await Employee.create({
            name: visitor.name,
            email: visitor.email,
            department,
            designation,
            salary: salary || 0,
        });

        const defaultPassword = "Password@123";
        const role = designation.toLowerCase().includes("hr") ? "hr" : "admin";
        const user = await User.create({
            name: visitor.name,
            email: visitor.email,
            password: defaultPassword,
            role: role
        });

        visitor.status = "converted";
        visitor.conversionType = "employee";
        visitor.convertedToId = employee._id;
        await visitor.save();

        res.json({
            message: "Visitor converted to employee successfully",
            visitor,
            employee,
            user: { email: user.email, role: user.role }
        });
    } catch (err) {
        console.error("Convert to employee error:", err);
        res.status(500).json({ message: err.message });
    }
};
