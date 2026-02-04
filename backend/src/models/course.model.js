const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        required: true,
        trim: true
    },

    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutor"
    },

    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill"
    }],

    tutorName: {
        type: String,
        trim: true
    },

    price: {
        type: Number,
        default: 0
    },

    duration: {
        type: Number,
        default: 0
    },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },

    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft"
    },

    studentsEnrolled: {
        type: Number,
        default: 0
    },

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date
    }
}, { timestamps: true })

module.exports = mongoose.model("Course", courseSchema)
