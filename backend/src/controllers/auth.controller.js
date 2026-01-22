const User = require("../models/users")

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const createdData = new User({ name, email, password })
        await createdData.save()
    } catch (err) {
        res.status(500).json({ message: "Internal server Error" })
    }
}