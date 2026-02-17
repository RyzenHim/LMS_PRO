const mongoose = require("mongoose");

const roomUnitSchema = new mongoose.Schema(
    {
        setup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
            // index: true
        },
        buildingName: {
            type: String,
            required: true,
            trim: true,
            // index: true 
        },

        floorNumber: {
            type: Number, required: true, min: 1,
            // index: true 
        },

        name: {
            type: String, required: true,
            trim: true
        },

        isAvailable: { type: Boolean, default: true },

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

roomUnitSchema.index(
    { setup: 1, floorNumber: 1, name: 1 },
    { unique: true }
);

module.exports = mongoose.model("RoomUnit", roomUnitSchema);
