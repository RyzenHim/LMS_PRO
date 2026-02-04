const User = require("../models/authUsers.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const secretKey = process.env.JWT_SECRET



exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All feilds are required" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: "User already exists" })

        const createdData = await User.create({ name, email, password, role })
        console.log("createdData");

        res.status(200).json({
            message: "User added successfully", user: {
                id: createdData._id,
                name: createdData.name,
                email: createdData.email,
                role: createdData.role
            }
        })
    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(500).json({ message: "Internal server Error" })
    }
}



exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: "Both field are required" })
        const existingUser = await User.findOne({ email })
        if (!existingUser) return res.status(400).json({ message: "User does not exist" })
        console.log("password", existingUser.password);
        const match = await bcrypt.compare(password, existingUser.password)
        if (match) {
            const token = jwt.sign({
                _id: existingUser._id,
                email: existingUser.email,
                role: existingUser.role
            }, secretKey, { expiresIn: '1h' })
            console.log("Loggd in ");
            return res.status(200).json({
                message: "Welcome",
                token,
                user: {
                    _id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    theme: existingUser.theme,
                    isActive: existingUser.isActive
                }
            })
        } else {
            return res.status(400).json({ message: "Password is worng" })
        }
    } catch (error) {
        console.error("Login Error:", error)
        return res.status(500).json({ message: "Internal server error " })
    }
}

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Get current user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { name, password, currentPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) {
            user.name = name;
        }

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to change password" });
            }

            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }

            user.password = password;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}




// exports.theme = async (req, res) => {
//     try {
//         const { mode } = req.body
//         if (mode){

//         }
//     } catch (err) {

//     }



// }