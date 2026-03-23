const mongoose = require("mongoose");
const Employee = require("../models/employee.model");
const User = require("../models/authUsers.model");
const Tutor = require("../models/tutor.model")
const nodemailer = require("nodemailer");

const parseListParams = (req) => {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
    const skip = (page - 1) * limit;

    const sortBy = (req.query.sortBy || "createdAt").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const search = (req.query.search || "").trim();

    return { page, limit, skip, sortBy, sortOrder, search };
};

const getSafeSort = (sortBy, sortOrder) => {
    const allowedSortFields = [
        "createdAt",
        "name",
        "email",
        "phone",
        "department",
        "designation",
        "salary",
        "joiningDate",
        "isActive",
    ];

    const safeField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    return { [safeField]: sortOrder };
};

const buildSearchQuery = (search) => {
    if (!search) return {};

    return {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
            { designation: { $regex: search, $options: "i" } },
        ],
    };
};

const buildFilterQuery = (req) => {
    const filter = {};

    if (req.query.department) {
        filter.department = { $regex: req.query.department, $options: "i" };
    }

    if (req.query.designation) {
        filter.designation = { $regex: req.query.designation, $options: "i" };
    }

    if (req.query.email) {
        filter.email = { $regex: req.query.email, $options: "i" };
    }

    if (req.query.isActive !== undefined) {
        if (req.query.isActive === "true") filter.isActive = true;
        if (req.query.isActive === "false") filter.isActive = false;
    }

    return filter;
};

const generatePassword = (length = 10) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#";
    let pass = "";
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSKEY,
    },
});

const sendEmployeeLoginMail = async ({ toEmail, name, password, role }) => {
    if (!toEmail) return;

    const mailOptions = {
        from: process.env.EMAILID,
        to: toEmail,
        subject: "Your LMS Employee Account Created - Login Details",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to LMS</h2>
        <p>Hello <b>${name || "Employee"}</b>,</p>

        <p>Your employee login has been created successfully.</p>

        <h3>Login Details</h3>
        <p><b>Email:</b> ${toEmail}</p>
        <p><b>Password:</b> ${password}</p>
        <p><b>Role:</b> ${role}</p>

        <p style="margin-top:15px;">
          Please login and change your password after first login.
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
};

const detectRoleFromDesignation = (designation = "") => {
    const d = String(designation).toLowerCase();
    if (d.includes("hr")) return "hr";
    return "admin";
};


exports.allEmployee = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const filter = {
            isDeleted: false,
            ...buildSearchQuery(search),
            ...buildFilterQuery(req),
        };

        const totalEmployes = await Employee.countDocuments(filter);

        const employees = await Employee.find(filter)
            .sort(getSafeSort(sortBy, sortOrder))
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            allEmployes: employees,
            totalEmployes,
            page,
            limit,
            totalPages: Math.ceil(totalEmployes / limit),
        });
    } catch (error) {
        console.error("Get employees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid employee id" });
        }

        const employee = await Employee.findOne({
            _id: id,
            isDeleted: false,
        }).lean();

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        const user = await User.findOne({
            employee: employee._id,
            isDeleted: false,
        }).select("email role theme isActive lastLogin createdAt");

        return res.status(200).json({ employee, user });
    } catch (error) {
        console.error("Get employee by id error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addEmployee = async (req, res) => {
    console.log("req.body", req.body);

    try {
        const { name, email, phone, department, designation, salary, joiningDate } =
            req.body;

        if (!name || !department || !designation || salary === undefined) {
            return res.status(400).json({
                message: "Name, department, designation and salary are required",
            });
        }

        const normalizedEmail = email ? email.toLowerCase().trim() : null;
        const normalizedDesignation = String(designation).toLowerCase().trim();

        if (normalizedEmail) {
            const existsEmail = await Employee.findOne({
                email: normalizedEmail,
                isDeleted: false,
            });

            if (existsEmail) {
                return res.status(400).json({
                    message: "Employee with this email already exists",
                });
            }
        }

        const employee = await Employee.create({
            name,
            email: normalizedEmail || undefined,
            phone: phone || undefined,
            department,
            designation: normalizedDesignation,
            salary: Number(salary),
            joiningDate: joiningDate || new Date(),

            isActive: true,
            isDeleted: false,
            deletedAt: null,
        });

        let createdTutor = null;

        if (normalizedDesignation === "teacher") {
            const existsTutor = await Tutor.findOne({
                employee: employee._id,
                isDeleted: false,
            });

            if (!existsTutor) {
                createdTutor = await Tutor.create({
                    employee: employee._id,

                    expertise: "Not Updated",
                    experience: 0,
                    qualification: "",
                    bio: "",

                    isActive: true,
                    isDeleted: false,
                    deletedAt: null,
                });
            }
        }

        let createdUser = null;

        if (normalizedEmail) {
            let role = detectRoleFromDesignation(employee.designation);

            if (normalizedDesignation === "teacher") {
                role = "tutor";
            }

            const alreadyUser = await User.findOne({
                email: normalizedEmail,
                isDeleted: false,
            });

            if (!alreadyUser) {
                const generatedPassword = generatePassword(10);

                createdUser = await User.create({
                    email: normalizedEmail,
                    password: generatedPassword,
                    role,
                    employee: employee._id,

                    tutor: createdTutor?._id || null,
                });

                try {
                    await sendEmployeeLoginMail({
                        toEmail: normalizedEmail,
                        name: employee.name,
                        password: generatedPassword,
                        role,
                    });
                } catch (mailErr) {
                    console.error("Employee mail sending failed:", mailErr);
                }
            }
        }

        return res.status(201).json({
            message:
                "Employee added successfully" +
                (createdUser ? " + login created + mail sent" : "") +
                (createdTutor ? " + tutor profile created" : ""),
            employee,
            tutor: createdTutor,
            loginCreated: Boolean(createdUser),
            tutorCreated: Boolean(createdTutor),
        });
    } catch (error) {
        console.error("Add employee error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        employee.isActive = !employee.isActive;
        await employee.save();

        await User.updateOne(
            { employee: employee._id, isDeleted: false },
            { $set: { isActive: employee.isActive } }
        );

        return res.status(200).json({
            message: `Employee ${employee.isActive ? "enabled" : "disabled"} successfully`,
            isActive: employee.isActive,
        });
    } catch (error) {
        console.error("Toggle Employee Status Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, phone, department, designation, salary, joiningDate, isActive } =
            req.body;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        if (name !== undefined) employee.name = name;

        if (email !== undefined) {
            const newEmail = email ? email.toLowerCase().trim() : null;

            if (newEmail) {
                const exists = await Employee.findOne({
                    email: newEmail,
                    _id: { $ne: employee._id },
                    isDeleted: false,
                });

                if (exists) {
                    return res.status(400).json({
                        message: "Another employee already uses this email",
                    });
                }
            }

            employee.email = newEmail;
        }

        if (phone !== undefined) employee.phone = phone;
        if (department !== undefined) employee.department = department;
        if (designation !== undefined) employee.designation = designation;
        if (salary !== undefined) employee.salary = Number(salary);

        if (joiningDate !== undefined) employee.joiningDate = joiningDate || employee.joiningDate;

        if (isActive !== undefined) employee.isActive = isActive;

        await employee.save();

        return res.status(200).json({
            message: "Employee updated successfully",
            employee,
        });
    } catch (error) {
        console.error("Update Employee Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.softDeleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date(),
            },
            { new: true }
        );

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        await User.updateOne(
            { employee: employee._id },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        return res.status(200).json({ message: "Employee moved to trash", employee });
    } catch (error) {
        console.error("Soft delete employee error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.restoreEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: false,
                deletedAt: null,
            },
            { new: true }
        );

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        await User.updateOne(
            { employee: employee._id },
            { $set: { isDeleted: false, deletedAt: null } }
        );

        return res.status(200).json({
            message: "Employee restored successfully",
            employee,
        });
    } catch (error) {
        console.error("Restore employee error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedEmployees = async (req, res) => {
    try {
        const { page, limit, skip, sortBy, sortOrder, search } = parseListParams(req);

        const filter = {
            isDeleted: true,
            ...buildSearchQuery(search),
            ...buildFilterQuery(req),
        };

        const totalEmployes = await Employee.countDocuments(filter);

        const employees = await Employee.find(filter)
            .sort(getSafeSort(sortBy, sortOrder))
            .skip(skip)
            .limit(limit)
            .lean();

        return res.status(200).json({
            allEmployes: employees,
            totalEmployes,
            page,
            limit,
            totalPages: Math.ceil(totalEmployes / limit),
        });
    } catch (error) {
        console.error("Get deleted employees error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
