import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../../api/axios";
import { timetableService } from "../../../../services/timetableService";
import { X, Loader2, AlertCircle } from "lucide-react";

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTimeInput = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const min = String(m % 60).padStart(2, "0");
  return `${h}:${min}`;
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

const EditTimetableSlotModal = ({
  open,
  onClose,
  slot,
  batchId,
  onSuccess,
}) => {
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState({
    tutor: "",
    course: "",
    subject: "",
    day: "mon",
    startTime: "10:00",
    endTime: "11:00",
    room: "",
  });

  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load slot into form
  useEffect(() => {
    if (!open || !slot) return;

    setError("");

    setForm({
      tutor: slot?.tutor?._id || slot?.tutor || "",
      course: slot?.course?._id || slot?.course || "",
      subject: slot?.subject || "",
      day: slot?.day || "mon",
      startTime: minutesToTimeInput(slot?.startMinutes || 0),
      endTime: minutesToTimeInput(slot?.endMinutes || 0),
      room: slot?.room || "",
    });
  }, [open, slot]);

  // Fetch dropdowns
  useEffect(() => {
    if (!open) return;

    const fetchDropdowns = async () => {
      try {
        setDropdownLoading(true);

        const [tRes, cRes] = await Promise.all([
          axiosInstance.get("/tutors/all"),
          axiosInstance.get("/courses/all"),
        ]);

        setTutors(tRes.data.tutors || []);
        setCourses(cRes.data.courses || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load tutors/courses. Check backend connection.");
      } finally {
        setDropdownLoading(false);
      }
    };

    fetchDropdowns();
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const isValidTime = useMemo(() => {
    const start = timeToMinutes(form.startTime);
    const end = timeToMinutes(form.endTime);
    return end > start;
  }, [form.startTime, form.endTime]);

  if (!open) return null;

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!slot?._id) return;
    if (!batchId) return;

    if (!isValidTime) {
      setError("End time must be greater than start time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        batch: batchId,
        tutor: form.tutor,
        course: form.course,
        subject: form.subject,
        day: form.day,
        startMinutes: timeToMinutes(form.startTime),
        endMinutes: timeToMinutes(form.endTime),
        room: form.room,
      };

      await timetableService.updateSlot(slot._id, payload);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Close modal backdrop"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Edit Timetable Slot
            </h2>
            <p className="mt-1 text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              Update slot details for this batch.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition"
            title="Close"
          >
            <X size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex gap-3 items-start rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Dropdown loading */}
          {dropdownLoading && (
            <div className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Loading tutors & courses...
            </div>
          )}

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Tutor <span className="text-red-500">*</span>
              </label>

              <select
                name="tutor"
                value={form.tutor}
                onChange={handleChange}
                disabled={dropdownLoading || loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
                required
              >
                <option value="">Select Tutor</option>
                {tutors.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Course <span className="text-red-500">*</span>
              </label>

              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                disabled={dropdownLoading || loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Subject <span className="text-xs opacity-70">(optional)</span>
            </label>

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              disabled={loading}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
              placeholder="Eg: React Basics"
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Day
              </label>

              <select
                name="day"
                value={form.day}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
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
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
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
                onChange={handleChange}
                disabled={loading}
                className={`mt-2 w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 disabled:opacity-60 ${
                  isValidTime
                    ? "border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] focus:ring-[#3F72AF]/40"
                    : "border-red-300 bg-red-50 focus:ring-red-200"
                }`}
              />
              {!isValidTime && (
                <p className="mt-1 text-xs text-red-600">
                  End time must be greater than start time.
                </p>
              )}
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Room <span className="text-xs opacity-70">(optional)</span>
            </label>

            <input
              name="room"
              value={form.room}
              onChange={handleChange}
              disabled={loading}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 disabled:opacity-60"
              placeholder="Room 101"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] text-sm text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || dropdownLoading || !isValidTime}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Slot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTimetableSlotModal;
