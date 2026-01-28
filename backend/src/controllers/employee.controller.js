const { json } = require("zod");
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



exports.updateEmployee = async (req, res) => {
    try {
        const { user } = req.user
        console.log(user);


    } catch (error) {
        return res.status(500).json({ message: "internal server error" })
    }
}