require('dotenv').config()
const port = process.env.PORT
console.log(port);
const express = require("express")

const app = express()
const mongoose = require('mongoose')
mongoose.connect(process.env.LINK)
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err))









app.post("/signup", async (req, res) => {

})










app.listen(process.env.PORT, () => console.log("Server started at port :-", process.env.PORT))
