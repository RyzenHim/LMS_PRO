const Employee = require("../models/employee.model");

exports.allEmployee = async (req, res) => {
    try {
        const allEmployes = await Employee.find({ isDeleted: false }).sort({ createdAt: -1 });
        return res.status(200).json(allEmployes);
    } catch (error) {
        console.error("Get employees error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        return res.status(200).json(employee);
    } catch (error) {
        console.error("Get employee by id error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            department,
            designation,
            salary,
            joiningDate
        } = req.body;

        if (!name || !email || !department || !designation || !salary) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const existingEmployee = await Employee.findOne({ email, isDeleted: false });
        if (existingEmployee) {
            return res.status(400).json({
                message: "Employee already exists"
            });
        }

        const employee = await Employee.create({
            name,
            email,
            department,
            designation,
            salary,
            joiningDate
        });

        res.status(201).json({
            message: "Employee added successfully",
            employee
        });

    } catch (error) {
        console.error("Add employee error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findOne({ _id: id, isDeleted: false });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        employee.isActive = !employee.isActive;
        await employee.save();

        res.status(200).json({
            message: `Employee ${employee.isActive ? "enabled" : "disabled"} successfully`,
            isActive: employee.isActive,
        });
    } catch (error) {
        console.error("Toggle Employee Status Error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, department, designation, salary, status } = req.body;

        if (!department && !designation && !salary && !name && !email && !status) {
            return res.status(400).json({
                message: "At least one field is required to update",
            });
        }

        const employee = await Employee.findOne({ _id: id, isDeleted: false });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        if (name) employee.name = name;
        if (email) employee.email = email;
        if (department) employee.department = department;
        if (designation) employee.designation = designation;
        if (salary !== undefined) employee.salary = salary;

        await employee.save();

        res.status(200).json({
            message: "Employee updated successfully",
            employee,
        });
    } catch (error) {
        console.error("Update Employee Error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
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

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee moved to trash", employee });
    } catch (error) {
        console.error("Soft delete employee error:", error);
        res.status(500).json({ message: "Internal server error" });
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

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee restored successfully", employee });
    } catch (error) {
        console.error("Restore employee error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getDeletedEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({ isDeleted: true })
            .sort({ deletedAt: -1 });
        res.status(200).json(employees);
    } catch (error) {
        console.error("Get deleted employees error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
