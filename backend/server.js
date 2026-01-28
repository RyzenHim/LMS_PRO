require('dotenv').config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
mongoose.connect(process.env.LINK)
    .then(() => {
        console.log("Database connected");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection failed:", err);
    });

const userRouter = require('./src/routes/userRoute');
app.use('/user', userRouter);

const employeeRouter = require("./src/routes/employee.route");
app.use("/emp", employeeRouter);
