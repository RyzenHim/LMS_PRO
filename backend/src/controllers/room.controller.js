const mongoose = require("mongoose");
const Room = require("../models/room.model");
const RoomUnit = require("../models/roomUnit.model");

// ===============================
// HELPERS
// ===============================
const normalizeFloors = (floors = [], totalFloors = 0) => {
    const parsed = Array.isArray(floors)
        ? floors
            .map((f) => ({
                floorNumber: Number(f.floorNumber),
                rooms: Array.isArray(f.rooms)
                    ? f.rooms
                        .map((r) => ({
                            name: String(r.name || "").trim(),
                        }))
                        .filter((r) => r.name.length > 0)
                    : [],
            }))
            .filter(
                (f) =>
                    Number.isInteger(f.floorNumber) && f.floorNumber > 0 && f.rooms.length > 0
            )
        : [];

    const map = new Map();
    parsed.forEach((f) => map.set(f.floorNumber, f.rooms));

    const limit = Number(totalFloors) || parsed.length;
    const rows = [];

    for (let floor = 1; floor <= limit; floor += 1) {
        rows.push({
            floorNumber: floor,
            rooms: map.get(floor) || [{ name: `Room 1` }],
        });
    }

    return rows;
};

const toSetup = (doc) => {
    const totalRooms = (doc.floors || []).reduce(
        (sum, f) => sum + (Array.isArray(f.rooms) ? f.rooms.length : 0),
        0
    );

    return {
        _id: doc._id,
        location: doc.location,
        buildingName: doc.buildingName,
        totalFloors: doc.totalFloors,
        floors: doc.floors,
        totalRooms,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};

// ===============================
// GET ALL ROOM SETUPS
// ===============================
exports.getAllRoomSetups = async (req, res) => {
    try {
        const rooms = await Room.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            rooms: rooms.map(toSetup),
            totalRooms: rooms.length,
        });
    } catch (error) {
        console.error("getAllRoomSetups error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ===============================
// GET ROOM OPTIONS (RoomUnit)
// ===============================
exports.getRoomOptions = async (req, res) => {
    try {
        const units = await RoomUnit.find({ isDeleted: false })
            .sort({ location: 1, buildingName: 1, floorNumber: 1, name: 1 })
            .lean();

        const options = units.map((u) => ({
            value: u._id, // ✅ IMPORTANT: ObjectId
            label: `${u.location} | ${u.buildingName} | Floor ${u.floorNumber} | ${u.name}`,
            location: u.location,
            buildingName: u.buildingName,
            floorNumber: u.floorNumber,
            roomName: u.name,
            setup: u.setup,
        }));

        return res.status(200).json({ options });
    } catch (error) {
        console.error("getRoomOptions error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ===============================
// CREATE ROOM SETUP + CREATE UNITS
// ===============================
exports.createRoomSetup = async (req, res) => {
    try {
        const { location, buildingName, totalFloors, floors } = req.body;

        if (!location || !buildingName || !totalFloors) {
            return res.status(400).json({
                message: "location, buildingName and totalFloors are required",
            });
        }

        const normalizedFloors = normalizeFloors(floors, totalFloors);
        if (!normalizedFloors.length) {
            return res.status(400).json({ message: "At least one floor is required" });
        }

        // 1) Create setup
        const roomSetup = await Room.create({
            location: String(location).trim(),
            buildingName: String(buildingName).trim(),
            totalFloors: Number(totalFloors),
            floors: normalizedFloors,
        });

        // 2) Create RoomUnits (scalable)
        const units = [];
        normalizedFloors.forEach((floor) => {
            (floor.rooms || []).forEach((r) => {
                units.push({
                    setup: roomSetup._id,
                    location: roomSetup.location,
                    buildingName: roomSetup.buildingName,
                    floorNumber: floor.floorNumber,
                    name: r.name,
                    isAvailable: true,
                });
            });
        });

        if (units.length) {
            await RoomUnit.insertMany(units);
        }

        return res.status(201).json({
            message: "Room setup created successfully",
            room: toSetup(roomSetup.toObject()),
        });
    } catch (error) {
        console.error("createRoomSetup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ===============================
// UPDATE ROOM SETUP + REBUILD UNITS
// ===============================
exports.updateRoomSetup = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid room setup id" });
        }

        const existing = await Room.findOne({ _id: id, isDeleted: false });
        if (!existing) {
            return res.status(404).json({ message: "Room setup not found" });
        }

        const nextLocation = req.body.location ?? existing.location;
        const nextBuildingName = req.body.buildingName ?? existing.buildingName;
        const nextTotalFloors = Number(req.body.totalFloors ?? existing.totalFloors);

        const nextFloors = normalizeFloors(
            req.body.floors ?? existing.floors,
            nextTotalFloors
        );

        if (!nextLocation || !nextBuildingName || !nextTotalFloors || !nextFloors.length) {
            return res.status(400).json({ message: "Invalid room setup payload" });
        }

        existing.location = String(nextLocation).trim();
        existing.buildingName = String(nextBuildingName).trim();
        existing.totalFloors = nextTotalFloors;
        existing.floors = nextFloors;
        await existing.save();

        // ✅ sync units
        // 1) soft delete old units
        await RoomUnit.updateMany(
            { setup: existing._id, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        // 2) create new units
        const units = [];
        nextFloors.forEach((floor) => {
            (floor.rooms || []).forEach((r) => {
                units.push({
                    setup: existing._id,
                    location: existing.location,
                    buildingName: existing.buildingName,
                    floorNumber: floor.floorNumber,
                    name: r.name,
                    isAvailable: true,
                });
            });
        });

        if (units.length) {
            await RoomUnit.insertMany(units);
        }

        return res.status(200).json({
            message: "Room setup updated successfully",
            room: toSetup(existing.toObject()),
        });
    } catch (error) {
        console.error("updateRoomSetup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ===============================
// DELETE ROOM SETUP + DELETE UNITS
// ===============================
exports.deleteRoomSetup = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid room setup id" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false });
        if (!room) {
            return res.status(404).json({ message: "Room setup not found" });
        }

        room.isDeleted = true;
        room.deletedAt = new Date();
        await room.save();

        // also delete all units
        await RoomUnit.updateMany(
            { setup: room._id, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        return res.status(200).json({ message: "Room setup deleted successfully" });
    } catch (error) {
        console.error("deleteRoomSetup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
