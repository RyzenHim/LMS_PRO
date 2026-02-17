import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { courseService } from "../../../../services/courseService";
import { tutorService } from "../../../../services/tutorService";
import axiosInstance from "../../../../api/axios";

const AddBatchModal = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [form, setForm] = useState({
    name: "",
    course: "",
    tutor: "",
    startDate: "",
    endDate: "",
    status: "upcoming",

    // ✅ NEW (optional)
    room: "",
  });

  useEffect(() => {
    if (open) {
      fetchCourses();
      fetchTutors();
      fetchRooms();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll({ limit: 100 });
      setCourses(res.data.courses || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await tutorService.getAll({ limit: 100 });
      setTutors(res.data.tutors || []);
    } catch (error) {
      console.error("Failed to fetch tutors", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axiosInstance.get("/rooms/all");
      setRooms(res.data?.rooms || []);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
  };

  // flatten rooms list
  const roomOptions = useMemo(() => {
    const out = [];

    for (const setup of rooms || []) {
      for (const floor of setup.floors || []) {
        for (const room of floor.rooms || []) {
          out.push({
            id: room._id,
            label: `${setup.location} • ${setup.buildingName} • Floor ${floor.floorNumber} • ${room.name}`,
          });
        }
      }
    }

    return out;
  }, [rooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.course || !form.tutor || !form.startDate) {
      return alert("Please fill all required fields");
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        room: form.room || undefined, // optional
      });

      setForm({
        name: "",
        course: "",
        tutor: "",
        startDate: "",
        endDate: "",
        status: "upcoming",
        room: "",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Add Batch</h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10 transition"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-white/70">
              Batch Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. MERN Batch Jan 2026"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            />
          </div>

          {/* Course */}
          <div>
            <label className="text-sm font-medium text-white/70">
              Course *
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tutor */}
          <div>
            <label className="text-sm font-medium text-white/70">Tutor *</label>
            <select
              name="tutor"
              value={form.tutor}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Select tutor</option>
              {tutors.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-white/70">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/70">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-white/70">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* ✅ Room (Optional) */}
          <div>
            <label className="text-sm font-medium text-white/70">
              Room (Optional)
            </label>
            <select
              name="room"
              value={form.room}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#141414] px-4 py-2 text-sm text-white outline-none"
            >
              <option value="">Not assigned</option>
              {roomOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/80 transition disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBatchModal;
