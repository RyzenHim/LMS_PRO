const Employee = require("../models/employee.model");




exports.allEmployee = async (req, res) => {
    try {
        const allEmployes = await Employee.find()
        return res.status(200).json(allEmployes)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

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

        const existingEmployee = await Employee.findOne({ email });
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

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        employee.isActive = !employee.isActive;
        await employee.save();

        res.status(200).json({
            message: `Employee ${employee.isActive ? "enabled" : "disabled"
                } successfully`,
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

        const employee = await Employee.findById(id);

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