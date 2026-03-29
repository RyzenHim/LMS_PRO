import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Building2,
  MapPin,
  Layers,
  Search,
  LayoutGrid,
} from "lucide-react";
import ModalShell from "../../components/ui/ModalShell";
import PageLoader from "../../components/ui/PageLoader";

const RoomField = ({ label, icon: Icon, ...props }) => (
  <label className="block">
    <p className="mb-2 text-sm font-medium text-[var(--lms-text)]">{label}</p>
    <div className="neu-inset flex items-center gap-3 rounded-[22px] px-4 py-3">
      {Icon ? (
        <Icon size={16} className="text-[var(--lms-accent-strong)]/70" />
      ) : null}
      <input
        {...props}
        className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
      />
    </div>
  </label>
);

const RoomsManager = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [form, setForm] = useState({
    location: "",
    buildingName: "",
    totalFloors: 1,
    floors: [{ floorNumber: 1, rooms: [{ name: "Room 1", isAvailable: true }] }],
  });

  const resetForm = () => {
    setForm({
      location: "",
      buildingName: "",
      totalFloors: 1,
      floors: [{ floorNumber: 1, rooms: [{ name: "Room 1", isAvailable: true }] }],
    });
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
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

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (r) =>
        r.location?.toLowerCase().includes(q) ||
        r.buildingName?.toLowerCase().includes(q),
    );
  }, [rooms, search]);

  const syncFloorsWithTotalFloors = (total) => {
    const totalFloors = Math.max(1, Number(total) || 1);
    const nextFloors = [];
    for (let i = 1; i <= totalFloors; i += 1) {
      const existingFloor = form.floors.find((f) => f.floorNumber === i);
      nextFloors.push(
        existingFloor || {
          floorNumber: i,
          rooms: [{ name: "Room 1", isAvailable: true }],
        },
      );
    }
    setForm((prev) => ({ ...prev, totalFloors, floors: nextFloors }));
  };

  const addRoomToFloor = (floorNumber) => {
    setForm((prev) => {
      const floors = prev.floors.map((f) => {
        if (f.floorNumber !== floorNumber) return f;
        const nextIndex = (f.rooms?.length || 0) + 1;
        return {
          ...f,
          rooms: [...(f.rooms || []), { name: `Room ${nextIndex}`, isAvailable: true }],
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
          rooms: nextRooms.length ? nextRooms : [{ name: "Room 1", isAvailable: true }],
        };
      });
      return { ...prev, floors };
    });
  };

  const updateRoomName = (floorNumber, roomIndex, value) => {
    setForm((prev) => {
      const floors = prev.floors.map((f) => {
        if (f.floorNumber !== floorNumber) return f;
        const nextRooms = [...(f.rooms || [])];
        nextRooms[roomIndex] = { ...nextRooms[roomIndex], name: value };
        return { ...f, rooms: nextRooms };
      });
      return { ...prev, floors };
    });
  };

  const calcTotalRooms = (floors) =>
    (floors || []).reduce((sum, f) => sum + (f.rooms?.length || 0), 0);

  const handleOpenCreate = () => {
    resetForm();
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      if (!form.location.trim() || !form.buildingName.trim()) return;
      await axiosInstance.post("/rooms", {
        location: form.location.trim(),
        buildingName: form.buildingName.trim(),
        totalFloors: Number(form.totalFloors),
        floors: form.floors,
      });
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
      await axiosInstance.put(`/rooms/${activeRoom._id}`, {
        location: form.location.trim(),
        buildingName: form.buildingName.trim(),
        totalFloors: Number(form.totalFloors),
        floors: form.floors,
      });
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
      await axiosInstance.delete(`/rooms/${activeRoom._id}`);
      setOpenDelete(false);
      setActiveRoom(null);
      await fetchRooms();
    } catch (err) {
      console.error("handleDelete error:", err);
    }
  };

  return (
    <div className="lms-page-enter space-y-6">
      <section className="neu-panel lms-card-hover lms-sheen rounded-[34px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--lms-accent-soft)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-accent-strong)]">
              <LayoutGrid size={14} />
              Infrastructure
            </div>
            <h1 className="text-3xl font-semibold text-[var(--lms-text)]">
              Rooms Setup
            </h1>
            <p className="max-w-2xl text-sm text-[var(--lms-text-soft)]">
              Manage buildings, floors, and rooms with a brighter hierarchical
              layout and softer modal editing flow.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchRooms}
              className="neu-button rounded-[22px] px-4 py-3 text-sm font-semibold"
            >
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button
              onClick={handleOpenCreate}
              className="neu-button neu-button-primary rounded-[22px] px-5 py-3 text-sm font-semibold"
            >
              <Plus size={16} />
              Add Setup
            </button>
          </div>
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-4">
        <div className="neu-inset flex items-center gap-3 rounded-[24px] px-4 py-3">
          <Search className="text-[var(--lms-accent-strong)]/70" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location or building..."
            className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
          />
        </div>
      </section>

      <section className="neu-panel rounded-[34px] p-4">
        {loading ? (
          <PageLoader label="Loading" detail="Fetching room configurations" compact />
        ) : filteredRooms.length === 0 ? (
          <div className="neu-inset rounded-[28px] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--lms-text)]">
              No room setups found
            </p>
            <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
              Create a building setup to start assigning space.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="neu-table min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left">Location</th>
                  <th className="px-5 py-4 text-left">Building</th>
                  <th className="px-5 py-4 text-left">Floors</th>
                  <th className="px-5 py-4 text-left">Total Rooms</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room._id}>
                    <td className="px-5 py-4 font-medium text-[var(--lms-text)]">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[var(--lms-accent-strong)]" />
                        {room.location}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text)]">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[var(--lms-text-soft)]" />
                        {room.buildingName}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text-soft)]">
                      {room.totalFloors}
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text-soft)]">
                      {room.totalRooms ?? calcTotalRooms(room.floors)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="neu-button rounded-[16px] px-4 py-2 text-sm font-semibold"
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleOpenDelete(room)}
                          className="neu-button-danger rounded-[16px] px-4 py-2 text-sm font-semibold"
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <RoomModal
        open={openCreate}
        title="Create Room Setup"
        subtitle="Define the location, building hierarchy, and individual rooms."
        form={form}
        setForm={setForm}
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
        syncFloorsWithTotalFloors={syncFloorsWithTotalFloors}
        addRoomToFloor={addRoomToFloor}
        removeRoomFromFloor={removeRoomFromFloor}
        updateRoomName={updateRoomName}
        submitLabel="Create Setup"
      />
      <RoomModal
        open={openEdit}
        title="Edit Room Setup"
        subtitle="Refine the building structure and room listing."
        form={form}
        setForm={setForm}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleUpdate}
        syncFloorsWithTotalFloors={syncFloorsWithTotalFloors}
        addRoomToFloor={addRoomToFloor}
        removeRoomFromFloor={removeRoomFromFloor}
        updateRoomName={updateRoomName}
        submitLabel="Save Changes"
      />

      <ModalShell
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete Room Setup"
        subtitle="This action removes the saved building structure."
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          <p className="text-sm text-[var(--lms-text-soft)]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--lms-text)]">
              {activeRoom?.buildingName}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenDelete(false)}
              className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="neu-button-danger rounded-[20px] px-5 py-3 text-sm font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
};

const RoomModal = ({
  open,
  title,
  subtitle,
  form,
  setForm,
  onClose,
  onSubmit,
  syncFloorsWithTotalFloors,
  addRoomToFloor,
  removeRoomFromFloor,
  updateRoomName,
  submitLabel,
}) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title={title}
    subtitle={subtitle}
    maxWidth="max-w-4xl"
  >
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <RoomField
          label="Location"
          icon={MapPin}
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        />
        <RoomField
          label="Building Name"
          icon={Building2}
          value={form.buildingName}
          onChange={(e) =>
            setForm((p) => ({ ...p, buildingName: e.target.value }))
          }
        />
      </div>

      <RoomField
        label="Total Floors"
        icon={Layers}
        type="number"
        min={1}
        value={form.totalFloors}
        onChange={(e) => syncFloorsWithTotalFloors(e.target.value)}
      />

      <div className="space-y-4">
        {form.floors.map((floor) => (
          <div key={floor.floorNumber} className="neu-panel-soft rounded-[28px] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-[var(--lms-text)]">
                Floor {floor.floorNumber}
              </h3>
              <button
                onClick={() => addRoomToFloor(floor.floorNumber)}
                className="neu-button rounded-[18px] px-4 py-2 text-sm font-semibold"
              >
                <Plus size={15} />
                Add Room
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {(floor.rooms || []).map((room, idx) => (
                <div key={`${floor.floorNumber}-${idx}`} className="flex gap-3">
                  <div className="neu-inset flex-1 rounded-[20px] px-4 py-3">
                    <input
                      value={room.name}
                      onChange={(e) =>
                        updateRoomName(floor.floorNumber, idx, e.target.value)
                      }
                      className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
                      placeholder="Room Name"
                    />
                  </div>
                  <button
                    onClick={() => removeRoomFromFloor(floor.floorNumber, idx)}
                    className="neu-button-danger rounded-[18px] px-4 py-3 text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="neu-button neu-button-primary rounded-[20px] px-5 py-3 text-sm font-semibold"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  </ModalShell>
);

export default RoomsManager;
