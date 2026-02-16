import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { roomService } from "../../services/roomService";

const defaultForm = {
  location: "",
  buildingName: "",
  totalFloors: 1,
  floors: [{ floorNumber: 1, roomsCount: 1 }],
};

const buildFloors = (totalFloors, prev = []) => {
  const parsed = Number(totalFloors) || 1;
  const map = new Map((prev || []).map((f) => [Number(f.floorNumber), Number(f.roomsCount)]));
  const next = [];
  for (let i = 1; i <= parsed; i += 1) {
    next.push({ floorNumber: i, roomsCount: map.get(i) || 1 });
  }
  return next;
};

const RoomsManager = ({ role = "admin" }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const title = role === "hr" ? "HR Room Manager" : "Room Manager";

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await roomService.getAll();
      setRooms(Array.isArray(res.data?.rooms) ? res.data.rooms : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load room setups");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const totalPhysicalRooms = useMemo(
    () => rooms.reduce((sum, row) => sum + Number(row.totalRooms || 0), 0),
    [rooms],
  );

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultForm);
    setOpenModal(true);
    setError("");
  };

  const openEditModal = (row) => {
    setEditingId(row._id);
    setForm({
      location: row.location || "",
      buildingName: row.buildingName || "",
      totalFloors: Number(row.totalFloors || 1),
      floors: buildFloors(row.totalFloors || 1, row.floors || []),
    });
    setOpenModal(true);
    setError("");
  };

  const closeModal = () => {
    if (saving) return;
    setOpenModal(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleTotalFloorsChange = (value) => {
    const totalFloors = Math.max(Number(value) || 1, 1);
    setForm((prev) => ({
      ...prev,
      totalFloors,
      floors: buildFloors(totalFloors, prev.floors),
    }));
  };

  const handleFloorRoomsChange = (floorNumber, value) => {
    const roomsCount = Math.max(Number(value) || 1, 1);
    setForm((prev) => ({
      ...prev,
      floors: prev.floors.map((f) =>
        Number(f.floorNumber) === Number(floorNumber) ? { ...f, roomsCount } : f,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      const payload = {
        location: form.location.trim(),
        buildingName: form.buildingName.trim(),
        totalFloors: Number(form.totalFloors),
        floors: form.floors.map((f) => ({
          floorNumber: Number(f.floorNumber),
          roomsCount: Number(f.roomsCount),
        })),
      };

      if (editingId) {
        await roomService.update(editingId, payload);
      } else {
        await roomService.create(payload);
      }

      setOpenModal(false);
      setEditingId(null);
      setForm(defaultForm);
      await loadRooms();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save room setup");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room setup?")) return;
    try {
      await roomService.remove(id);
      await loadRooms();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete room setup");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">
              {title}
            </h1>
            <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
              Manage location, building, floor and room counts for timetable allocation.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] text-white text-sm font-semibold hover:bg-[#2f5d95] transition-all"
          >
            <Plus size={16} />
            Add Building
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/40 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl p-4">
          <p className="text-xs text-[#3F72AF] dark:text-slate-300">Building Setups</p>
          <p className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">{rooms.length}</p>
        </div>
        <div className="rounded-2xl border border-white/40 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl p-4">
          <p className="text-xs text-[#3F72AF] dark:text-slate-300">Total Physical Rooms</p>
          <p className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">
            {totalPhysicalRooms}
          </p>
        </div>
        <div className="rounded-2xl border border-white/40 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/55 backdrop-blur-xl p-4">
          <p className="text-xs text-[#3F72AF] dark:text-slate-300">Latest Sync</p>
          <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/40 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-[#DBE2EF] dark:border-slate-700">
          <h2 className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Building Configurations
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[#3F72AF] dark:text-slate-300">Loading...</div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-[#3F72AF] dark:text-slate-300">
            No building setup found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/60 dark:bg-slate-900/70">
                <tr>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Building</th>
                  <th className="p-3 text-left">Floors</th>
                  <th className="p-3 text-left">Rooms</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((row) => (
                  <tr key={row._id} className="border-t border-[#DBE2EF] dark:border-slate-700">
                    <td className="p-3 text-[#112D4E] dark:text-[#DBE2EF]">{row.location}</td>
                    <td className="p-3 text-[#112D4E] dark:text-[#DBE2EF]">{row.buildingName}</td>
                    <td className="p-3 text-[#112D4E] dark:text-[#DBE2EF]">{row.totalFloors}</td>
                    <td className="p-3 text-[#112D4E] dark:text-[#DBE2EF]">{row.totalRooms}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(row)}
                          className="p-2 rounded-lg border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"
            onClick={closeModal}
            aria-label="Close room modal"
          />
          <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-2xl rounded-3xl border border-white/50 dark:border-slate-700 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                  {editingId ? "Update Building" : "Add Building"}
                </h3>
                <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
                  Define floors and room counts for timetable room allocation.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Location
                </label>
                <div className="mt-2 relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3F72AF]"
                  />
                  <input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Building Name
                </label>
                <div className="mt-2 relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3F72AF]"
                  />
                  <input
                    value={form.buildingName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, buildingName: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Number Of Floors
              </label>
              <input
                type="number"
                min={1}
                value={form.totalFloors}
                onChange={(e) => handleTotalFloorsChange(e.target.value)}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
              />
            </div>

            <div className="space-y-3">
              {form.floors.map((floor) => (
                <div
                  key={floor.floorNumber}
                  className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-800/50"
                >
                  <div className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                    Floor {floor.floorNumber}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={floor.roomsCount}
                    onChange={(e) =>
                      handleFloorRoomsChange(floor.floorNumber, e.target.value)
                    }
                    className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm text-[#112D4E] dark:text-[#DBE2EF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#3F72AF] text-white text-sm font-semibold hover:bg-[#2f5d95] disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomsManager;
