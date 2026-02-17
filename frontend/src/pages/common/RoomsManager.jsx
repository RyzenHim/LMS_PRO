import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  X,
  Building2,
  MapPin,
  Layers,
  Search,
} from "lucide-react";

// ===============================
// Reusable UI Components
// ===============================
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-[#0B1220] dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, icon: Icon, ...props }) => {
  return (
    <label className="block">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>

      <div className="relative mt-2">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </span>
        )}

        <input
          {...props}
          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition
          focus:border-amber-500 focus:ring-2 focus:ring-amber-200
          dark:border-slate-700 dark:bg-[#070B14] dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20
          ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </label>
  );
};

const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 active:scale-[0.98] transition disabled:opacity-60"
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 active:scale-[0.98] transition
    dark:border-slate-700 dark:bg-[#070B14] dark:text-white dark:hover:bg-slate-900"
  >
    {children}
  </button>
);

const DangerButton = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700 active:scale-[0.98] transition disabled:opacity-60"
  >
    {children}
  </button>
);

// ===============================
// Main Component
// ===============================
const RoomsManager = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  const [search, setSearch] = useState("");

  // modals
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [activeRoom, setActiveRoom] = useState(null);

  // create/edit form
  const [form, setForm] = useState({
    location: "",
    buildingName: "",
    totalFloors: 1,
    floors: [
      {
        floorNumber: 1,
        rooms: [{ name: "Room 1", isAvailable: true }],
      },
    ],
  });

  const resetForm = () => {
    setForm({
      location: "",
      buildingName: "",
      totalFloors: 1,
      floors: [
        {
          floorNumber: 1,
          rooms: [{ name: "Room 1", isAvailable: true }],
        },
      ],
    });
  };

  // ===============================
  // API
  // ===============================
  const fetchRooms = async () => {
    try {
      setLoading(true);

      // ✅ FIXED ROUTE
      const res = await axiosInstance.get("/rooms/all");

      setRooms(res.data?.rooms || []);
    } catch (err) {
      console.error("fetchRooms error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ===============================
  // Helpers
  // ===============================
  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;

    return rooms.filter((r) => {
      return (
        r.location?.toLowerCase().includes(q) ||
        r.buildingName?.toLowerCase().includes(q)
      );
    });
  }, [rooms, search]);

  const syncFloorsWithTotalFloors = (total) => {
    const totalFloors = Math.max(1, Number(total) || 1);

    const nextFloors = [];

    for (let i = 1; i <= totalFloors; i++) {
      const existingFloor = form.floors.find((f) => f.floorNumber === i);

      nextFloors.push(
        existingFloor || {
          floorNumber: i,
          rooms: [{ name: `Room 1`, isAvailable: true }],
        },
      );
    }

    setForm((prev) => ({
      ...prev,
      totalFloors,
      floors: nextFloors,
    }));
  };

  const addRoomToFloor = (floorNumber) => {
    setForm((prev) => {
      const floors = prev.floors.map((f) => {
        if (f.floorNumber !== floorNumber) return f;

        const nextIndex = (f.rooms?.length || 0) + 1;

        return {
          ...f,
          rooms: [
            ...(f.rooms || []),
            { name: `Room ${nextIndex}`, isAvailable: true },
          ],
        };
      });

      return { ...prev, floors };
    });
  };

  const removeRoomFromFloor = (floorNumber, roomIndex) => {
    setForm((prev) => {
      const floors = prev.floors.map((f) => {
        if (f.floorNumber !== floorNumber) return f;

        const nextRooms = [...(f.rooms || [])];
        nextRooms.splice(roomIndex, 1);

        return {
          ...f,
          rooms: nextRooms.length
            ? nextRooms
            : [{ name: "Room 1", isAvailable: true }],
        };
      });

      return { ...prev, floors };
    });
  };

  const updateRoomName = (floorNumber, roomIndex, value) => {
    setForm((prev) => {
      const floors = prev.floors.map((f) => {
        if (f.floorNumber !== floorNumber) return f;

        const rooms = [...(f.rooms || [])];
        rooms[roomIndex] = { ...rooms[roomIndex], name: value };

        return { ...f, rooms };
      });

      return { ...prev, floors };
    });
  };

  const calcTotalRooms = (floors) => {
    return (floors || []).reduce((sum, f) => sum + (f.rooms?.length || 0), 0);
  };

  // ===============================
  // CRUD Handlers
  // ===============================
  const handleOpenCreate = () => {
    resetForm();
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      if (!form.location.trim() || !form.buildingName.trim()) return;

      const payload = {
        location: form.location.trim(),
        buildingName: form.buildingName.trim(),
        totalFloors: Number(form.totalFloors),
        floors: form.floors,
      };

      // ✅ FIXED ROUTE
      await axiosInstance.post("/rooms", payload);

      setOpenCreate(false);
      await fetchRooms();
    } catch (err) {
      console.error("handleCreate error:", err);
    }
  };

  const handleOpenEdit = (room) => {
    setActiveRoom(room);

    setForm({
      location: room.location || "",
      buildingName: room.buildingName || "",
      totalFloors: room.totalFloors || 1,
      floors: room.floors || [],
    });

    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    try {
      if (!activeRoom?._id) return;

      const payload = {
        location: form.location.trim(),
        buildingName: form.buildingName.trim(),
        totalFloors: Number(form.totalFloors),
        floors: form.floors,
      };

      // ✅ FIXED ROUTE
      await axiosInstance.put(`/rooms/${activeRoom._id}`, payload);

      setOpenEdit(false);
      setActiveRoom(null);

      await fetchRooms();
    } catch (err) {
      console.error("handleUpdate error:", err);
    }
  };

  const handleOpenDelete = (room) => {
    setActiveRoom(room);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      if (!activeRoom?._id) return;

      // ✅ FIXED ROUTE
      await axiosInstance.delete(`/rooms/${activeRoom._id}`);

      setOpenDelete(false);
      setActiveRoom(null);

      await fetchRooms();
    } catch (err) {
      console.error("handleDelete error:", err);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Rooms Setup
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage buildings, floors, and rooms with a clean premium layout.
          </p>
        </div>

        <div className="flex gap-2">
          <SecondaryButton onClick={fetchRooms}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </SecondaryButton>

          <PrimaryButton onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Add Setup
          </PrimaryButton>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Search size={18} />
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location or building..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-11 text-sm text-slate-900 outline-none transition
            focus:border-amber-500 focus:ring-2 focus:ring-amber-200
            dark:border-slate-700 dark:bg-[#070B14] dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#070B14]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-slate-700 dark:text-slate-200">
                  Location
                </th>
                <th className="px-5 py-4 text-left font-bold text-slate-700 dark:text-slate-200">
                  Building
                </th>
                <th className="px-5 py-4 text-left font-bold text-slate-700 dark:text-slate-200">
                  Floors
                </th>
                <th className="px-5 py-4 text-left font-bold text-slate-700 dark:text-slate-200">
                  Total Rooms
                </th>
                <th className="px-5 py-4 text-right font-bold text-slate-700 dark:text-slate-200">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-300"
                  >
                    Loading room setups...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500 dark:text-slate-300"
                  >
                    No room setups found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, idx) => (
                  <tr
                    key={room._id}
                    className={`border-t border-slate-100 dark:border-slate-800 transition
                    ${idx % 2 === 0 ? "bg-white dark:bg-[#070B14]" : "bg-slate-50/60 dark:bg-slate-900/40"}
                    hover:bg-amber-50 dark:hover:bg-amber-400/10`}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-amber-600" />
                        {room.location}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-500" />
                        {room.buildingName}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-slate-500" />
                        {room.totalFloors}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                      {room.totalRooms ?? calcTotalRooms(room.floors)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <SecondaryButton onClick={() => handleOpenEdit(room)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </SecondaryButton>

                        <DangerButton onClick={() => handleOpenDelete(room)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DangerButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================
          CREATE MODAL
      ============================ */}
      <Modal
        open={openCreate}
        title="Create Room Setup"
        onClose={() => setOpenCreate(false)}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Location"
            icon={MapPin}
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
          />
          <Input
            label="Building Name"
            icon={Building2}
            value={form.buildingName}
            onChange={(e) =>
              setForm((p) => ({ ...p, buildingName: e.target.value }))
            }
          />
        </div>

        <div className="mt-4">
          <Input
            label="Total Floors"
            icon={Layers}
            type="number"
            min={1}
            value={form.totalFloors}
            onChange={(e) => syncFloorsWithTotalFloors(e.target.value)}
          />
        </div>

        {/* Floors */}
        <div className="mt-6 space-y-6">
          {form.floors.map((floor) => (
            <div
              key={floor.floorNumber}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Floor {floor.floorNumber}
                </h3>

                <button
                  onClick={() => addRoomToFloor(floor.floorNumber)}
                  className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black transition
                  dark:bg-white dark:text-black"
                >
                  + Add Room
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {(floor.rooms || []).map((room, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={room.name}
                      onChange={(e) =>
                        updateRoomName(floor.floorNumber, idx, e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none
                      focus:border-amber-500 focus:ring-2 focus:ring-amber-200
                      dark:border-slate-700 dark:bg-[#070B14] dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
                      placeholder="Room Name"
                    />

                    <button
                      onClick={() =>
                        removeRoomFromFloor(floor.floorNumber, idx)
                      }
                      className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-7 flex justify-end gap-2">
          <SecondaryButton onClick={() => setOpenCreate(false)}>
            Cancel
          </SecondaryButton>

          <PrimaryButton onClick={handleCreate}>Create Setup</PrimaryButton>
        </div>
      </Modal>

      {/* ============================
          EDIT MODAL
      ============================ */}
      <Modal
        open={openEdit}
        title="Edit Room Setup"
        onClose={() => setOpenEdit(false)}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Location"
            icon={MapPin}
            value={form.location}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
          />
          <Input
            label="Building Name"
            icon={Building2}
            value={form.buildingName}
            onChange={(e) =>
              setForm((p) => ({ ...p, buildingName: e.target.value }))
            }
          />
        </div>

        <div className="mt-4">
          <Input
            label="Total Floors"
            icon={Layers}
            type="number"
            min={1}
            value={form.totalFloors}
            onChange={(e) => syncFloorsWithTotalFloors(e.target.value)}
          />
        </div>

        {/* Floors */}
        <div className="mt-6 space-y-6">
          {form.floors.map((floor) => (
            <div
              key={floor.floorNumber}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Floor {floor.floorNumber}
                </h3>

                <button
                  onClick={() => addRoomToFloor(floor.floorNumber)}
                  className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black transition
                  dark:bg-white dark:text-black"
                >
                  + Add Room
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {(floor.rooms || []).map((room, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={room.name}
                      onChange={(e) =>
                        updateRoomName(floor.floorNumber, idx, e.target.value)
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none
                      focus:border-amber-500 focus:ring-2 focus:ring-amber-200
                      dark:border-slate-700 dark:bg-[#070B14] dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-400/20"
                      placeholder="Room Name"
                    />

                    <button
                      onClick={() =>
                        removeRoomFromFloor(floor.floorNumber, idx)
                      }
                      className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-7 flex justify-end gap-2">
          <SecondaryButton onClick={() => setOpenEdit(false)}>
            Cancel
          </SecondaryButton>

          <PrimaryButton onClick={handleUpdate}>Save Changes</PrimaryButton>
        </div>
      </Modal>

      {/* ============================
          DELETE MODAL
      ============================ */}
      <Modal
        open={openDelete}
        title="Delete Room Setup"
        onClose={() => setOpenDelete(false)}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {activeRoom?.buildingName}
          </span>
          ?
        </p>

        <div className="mt-7 flex justify-end gap-2">
          <SecondaryButton onClick={() => setOpenDelete(false)}>
            Cancel
          </SecondaryButton>

          <DangerButton onClick={handleDelete}>Delete</DangerButton>
        </div>
      </Modal>
    </div>
  );
};

export default RoomsManager;
