import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import axiosInstance from "../../../../api/axios";

const AssignBatchRoomModal = ({ open, onClose, batch, onAssigned }) => {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  // selections
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setLoading(false);

    // reset
    setLocation("");
    setBuilding("");
    setFloorNumber("");
    setRoomName("");

    fetchRooms();
  }, [open]);

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get("/rooms/all");
      setRooms(res.data?.rooms || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load rooms");
    }
  };

  // options
  const locations = useMemo(() => {
    return [...new Set((rooms || []).map((r) => r.location).filter(Boolean))];
  }, [rooms]);

  const buildings = useMemo(() => {
    return (rooms || [])
      .filter((r) => r.location === location)
      .map((r) => r.buildingName)
      .filter(Boolean);
  }, [rooms, location]);

  const selectedSetup = useMemo(() => {
    return (rooms || []).find(
      (r) => r.location === location && r.buildingName === building,
    );
  }, [rooms, location, building]);

  const floors = useMemo(() => {
    return selectedSetup?.floors || [];
  }, [selectedSetup]);

  const roomsOnFloor = useMemo(() => {
    const floor = floors.find(
      (f) => String(f.floorNumber) === String(floorNumber),
    );
    return floor?.rooms || [];
  }, [floors, floorNumber]);

  const handleAssign = async () => {
    setError("");

    if (!batch?._id) return;

    if (!location || !building || !floorNumber || !roomName) {
      setError("Please select location, building, floor and room");
      return;
    }

    // find room object from setup
    const floor = floors.find(
      (f) => String(f.floorNumber) === String(floorNumber),
    );
    const room = floor?.rooms?.find((r) => r.name === roomName);

    if (!room?._id) {
      setError(
        "Selected room not found (missing _id). Please re-check backend.",
      );
      return;
    }

    try {
      setLoading(true);

      // ✅ IMPORTANT:
      // your backend must support updating batch room
      // Example:
      // PUT /batch/:id  { room: roomId }
      await axiosInstance.put(`/batch/${batch._id}`, {
        room: room._id,
      });

      onAssigned?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to assign room");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !batch) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#101010] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Assign Room</h2>
            <p className="text-sm text-white/50 mt-1">
              Batch: <span className="text-white/80">{batch.name}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10 transition"
          >
            <X className="h-5 w-5 text-white/70" />
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 font-medium">{error}</p>
        )}

        {/* Form */}
        <div className="mt-6 space-y-4">
          {/* Location */}
          <div>
            <label className="text-sm font-medium text-white/70">
              Location *
            </label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setBuilding("");
                setFloorNumber("");
                setRoomName("");
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Building */}
          <div>
            <label className="text-sm font-medium text-white/70">
              Building *
            </label>
            <select
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                setFloorNumber("");
                setRoomName("");
              }}
              disabled={!location}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none disabled:opacity-50"
            >
              <option value="">Select building</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="text-sm font-medium text-white/70">Floor *</label>
            <select
              value={floorNumber}
              onChange={(e) => {
                setFloorNumber(e.target.value);
                setRoomName("");
              }}
              disabled={!selectedSetup}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none disabled:opacity-50"
            >
              <option value="">Select floor</option>
              {floors.map((f) => (
                <option key={f.floorNumber} value={f.floorNumber}>
                  Floor {f.floorNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label className="text-sm font-medium text-white/70">Room *</label>
            <select
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={!floorNumber}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none disabled:opacity-50"
            >
              <option value="">Select room</option>
              {roomsOnFloor.map((r) => (
                <option key={r._id || r.name} value={r.name}>
                  {r.name} {r.isAvailable === false ? "(Unavailable)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-7 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleAssign}
            disabled={loading}
            className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/80 transition disabled:opacity-60"
          >
            {loading ? "Assigning..." : "Assign Room"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBatchRoomModal;
