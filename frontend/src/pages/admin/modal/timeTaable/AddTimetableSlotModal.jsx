import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { timetableService } from "../../../../services/timetableService";
import { roomService } from "../../../../services/roomService";
import { X, Loader2, AlertCircle } from "lucide-react";

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const getTutorName = (t) => t?.employee?.name || t?.name || "Tutor";

const AddTimetableSlotModal = ({
  open,
  onClose,
  batchId,
  selectedCourseId,
  onSuccess,
  prefillDay,
  prefillStartMinutes,
}) => {
  const [tutors, setTutors] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  const [form, setForm] = useState({
    tutor: "",
    subject: "",
    day: "mon",
    startTime: "10:00",
    endTime: "11:00",
    location: "",
    buildingName: "",
    floorNumber: "",
    room: "",
  });

  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm((prev) => {
      const next = { ...prev };
      if (prefillDay) next.day = prefillDay;
      if (typeof prefillStartMinutes === "number") {
        const h = String(Math.floor(prefillStartMinutes / 60)).padStart(2, "0");
        const m = String(prefillStartMinutes % 60).padStart(2, "0");
        next.startTime = `${h}:${m}`;

        const end = prefillStartMinutes + 60;
        const eh = String(Math.floor(end / 60)).padStart(2, "0");
        const em = String(end % 60).padStart(2, "0");
        next.endTime = `${eh}:${em}`;
      }
      return next;
    });
  }, [open, prefillDay, prefillStartMinutes]);

  useEffect(() => {
    if (!open) return;
    const fetchDropdowns = async () => {
      try {
        setDropdownLoading(true);
        const [tRes, rRes] = await Promise.all([
          axiosInstance.get("/tutors/all"),
          roomService.getOptions(),
        ]);
        setTutors(Array.isArray(tRes.data?.tutors) ? tRes.data.tutors : []);
        setRoomOptions(Array.isArray(rRes.data?.options) ? rRes.data.options : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load tutors/rooms.");
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchDropdowns();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const isValidTime = useMemo(() => {
    return timeToMinutes(form.endTime) > timeToMinutes(form.startTime);
  }, [form.startTime, form.endTime]);

  const locations = useMemo(() => {
    return Array.from(new Set(roomOptions.map((r) => r.location).filter(Boolean)));
  }, [roomOptions]);

  const buildings = useMemo(() => {
    if (!form.location) return [];
    return Array.from(
      new Set(
        roomOptions
          .filter((r) => r.location === form.location)
          .map((r) => r.buildingName)
          .filter(Boolean),
      ),
    );
  }, [roomOptions, form.location]);

  const floors = useMemo(() => {
    if (!form.location || !form.buildingName) return [];
    return Array.from(
      new Set(
        roomOptions
          .filter(
            (r) => r.location === form.location && r.buildingName === form.buildingName,
          )
          .map((r) => String(r.floorNumber)),
      ),
    );
  }, [roomOptions, form.location, form.buildingName]);

  const rooms = useMemo(() => {
    if (!form.location || !form.buildingName || !form.floorNumber) return [];
    return roomOptions.filter(
      (r) =>
        r.location === form.location &&
        r.buildingName === form.buildingName &&
        String(r.floorNumber) === String(form.floorNumber),
    );
  }, [roomOptions, form.location, form.buildingName, form.floorNumber]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchId || !selectedCourseId) {
      setError("Select course and batch first.");
      return;
    }
    if (!isValidTime) {
      setError("End time must be greater than start time.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        batch: batchId,
        course: selectedCourseId,
        tutor: form.tutor,
        subject: form.subject,
        day: form.day,
        startMinutes: timeToMinutes(form.startTime),
        endMinutes: timeToMinutes(form.endTime),
        room: form.room || "",
      };
      await timetableService.addSlot(payload);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-md"
        aria-label="Close modal backdrop"
      />

      <div className="relative w-full max-w-3xl rounded-3xl border border-white/50 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#DBE2EF] dark:border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Add Timetable Slot
            </h2>
            <p className="mt-1 text-sm text-[#3F72AF] dark:text-slate-300">
              Course is auto-selected from the chosen batch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="flex gap-3 items-start rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {dropdownLoading && (
            <div className="text-sm text-[#3F72AF] dark:text-slate-300 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Loading tutors & rooms...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Tutor <span className="text-red-500">*</span>
              </label>
              <select
                name="tutor"
                value={form.tutor}
                onChange={(e) => setForm((p) => ({ ...p, tutor: e.target.value }))}
                disabled={dropdownLoading || loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
                required
              >
                <option value="">Select Tutor</option>
                {tutors.map((t) => (
                  <option key={t._id} value={t._id}>
                    {getTutorName(t)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Subject
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                disabled={loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
                placeholder="Eg: React Basics"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Day
              </label>
              <select
                name="day"
                value={form.day}
                onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
                disabled={loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
              >
                {DAYS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Start
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                disabled={loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                End
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                disabled={loading}
                className={`mt-2 w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 disabled:opacity-60 ${
                  isValidTime
                    ? "border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:ring-[#3F72AF]/40"
                    : "border-red-300 bg-red-50 focus:ring-red-200"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Location
              </label>
              <select
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    location: e.target.value,
                    buildingName: "",
                    floorNumber: "",
                    room: "",
                  }))
                }
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Building
              </label>
              <select
                value={form.buildingName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    buildingName: e.target.value,
                    floorNumber: "",
                    room: "",
                  }))
                }
                disabled={!form.location}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm disabled:opacity-60"
              >
                <option value="">Select Building</option>
                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Floor
              </label>
              <select
                value={form.floorNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, floorNumber: e.target.value, room: "" }))
                }
                disabled={!form.buildingName}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm disabled:opacity-60"
              >
                <option value="">Select Floor</option>
                {floors.map((f) => (
                  <option key={f} value={f}>
                    Floor {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Room
              </label>
              <select
                value={form.room}
                onChange={(e) => setForm((p) => ({ ...p, room: e.target.value }))}
                disabled={!form.floorNumber}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm disabled:opacity-60"
              >
                <option value="">Select Room</option>
                {rooms.map((r) => (
                  <option key={r.value} value={r.value}>
                    Room {r.roomNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || dropdownLoading || !isValidTime}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Slot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTimetableSlotModal;
