const User = require("../models/authUsers.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const secretKey = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password || !role || !name) {
            return res
                .status(400)
                .json({ message: "Email, password , name and role are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const createdUser = await User.create({
            name,
            email,
            password,
            role,
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                theme: createdUser.theme,
                isActive: createdUser.isActive,
            },
        });
    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
            isDeleted: false,
        })
            .select("+password")
            .populate("student")
            .populate("tutor")
            .populate("employee");

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is inactive" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Password is wrong" });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
            secretKey,
            { expiresIn: "1h" }
        );

        const safeUser = user.toObject();
        delete safeUser.password;

        const redirectMap = {
            admin: "/admin",
            hr: "/hr",
            tutor: "/instructor",
            student: "/student",
        };

        const redirectTo = redirectMap[user.role] || "/";

        return res.status(200).json({
            message: "Welcome",
            token,
            user: safeUser,
            redirectTo,
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("student")
            .populate("tutor")
            .populate("employee");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, password, currentPassword, theme } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name !== undefined) {
            user.name = String(name || "").trim();
        }

        if (theme !== undefined) {
            if (!["light", "dark"].includes(theme)) {
                return res.status(400).json({ message: "Invalid theme value" });
            }
            user.theme = theme;
        }

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    message: "Current password is required to change password",
                });
            }

            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res
                    .status(400)
                    .json({ message: "Current password is incorrect" });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                });
            }

            user.password = password;
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .populate("student")
            .populate("tutor")
            .populate("employee");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email, type: "reset" },
            secretKey,
            { expiresIn: "30m" }
        );

        return res.status(200).json({
            message: "Password reset link sent to your email",
            token,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Reset token is required" });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        if (decoded.type !== "reset") {
            return res.status(400).json({ message: "Invalid reset token" });
        }

        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = password;
        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.logout = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
