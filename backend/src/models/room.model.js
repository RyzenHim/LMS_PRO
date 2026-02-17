const mongoose = require("mongoose");

const roomSchemaInsideFloor = new mongoose.Schema(
    {
        name: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
    },
    { _id: false }
);

const roomFloorSchema = new mongoose.Schema(
    {
        floorNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        rooms: {
            type: [roomSchemaInsideFloor],
            default: [],
        },
    },
    { _id: false }
);

const roomSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            trim: true,
        },
        buildingName: {
            type: String,
            required: true,
            trim: true,
        },
        totalFloors: {
            type: Number,
            required: true,
            min: 1,
        },
        floors: {
            type: [roomFloorSchema],
            default: [],
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
