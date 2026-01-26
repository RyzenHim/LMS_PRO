const User = require("../models/users")

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const createdData = new User({ name, email, password })
        await createdData.save()
        res.status(200).json(createdData)
    } catch (err) {
        res.status(500).json({ message: "Internal server Error" })
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