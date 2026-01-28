const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            // select: false
        },

        role: {
            type: String,
            enum: ["student", "instructor", "admin", "hr"],
            default: "student"
        },

        theme: {
            type: String,
            enum: ["light", "dark"],
            default: "light"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);



userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

module.exports = mongoose.model("User", userSchema);
