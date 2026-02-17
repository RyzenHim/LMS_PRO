import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarClock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { timetableService } from "../../services/timetableService";
import AddTimetableSlotModal from "./modal/timeTaable/AddTimetableSlotModal";
import EditTimetableSlotModal from "./modal/timeTaable/EditTimetableSlotModal";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const START_HOUR = 9;
const END_HOUR = 21;
const SLOT_HEIGHT = 56;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const getTutorName = (slot) =>
  slot?.tutor?.employee?.name || slot?.tutor?.name || "Tutor";

const getCourseTitle = (slot) =>
  slot?.course?.title || slot?.courseTitle || "Course";

const getRoomLabel = (slot) => {
  if (!slot?.room) return null;
  if (typeof slot.room === "string") return slot.room;
  return (
    slot.room?.name ||
    slot.room?.roomNumber ||
    slot.room?.location ||
    slot.room?._id ||
    null
  );
};

const AdminTimetable = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [prefillDay, setPrefillDay] = useState("");
  const [prefillStart, setPrefillStart] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotPopup, setSlotPopup] = useState({ open: false, x: 0, y: 0 });

  const popupRef = useRef(null);

  // ============================
  // INIT: Fetch Courses
  // ============================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get("/courses/all");
        setCourses(Array.isArray(res.data?.courses) ? res.data.courses : []);
      } catch (err) {
        console.error("Fetch courses error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // ============================
  // Fetch batches when course changes
  // ============================
  useEffect(() => {
    const fetchBatchesByCourse = async () => {
      if (!selectedCourse) {
        setBatches([]);
        setSelectedBatch("");
        return;
      }

      try {
        setBatchLoading(true);
        const res = await axiosInstance.get(
          `/batch/by-course/${selectedCourse}`,
        );

        const rows = Array.isArray(res.data?.batches) ? res.data.batches : [];
        setBatches(rows);

        // reset invalid selection
        if (!rows.find((b) => b._id === selectedBatch)) {
          setSelectedBatch("");
        }
      } catch (err) {
        console.error("Fetch course batches error:", err);
        setBatches([]);
        setSelectedBatch("");
      } finally {
        setBatchLoading(false);
      }
    };

    fetchBatchesByCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  // ============================
  // Fetch timetable
  // ============================
  const fetchTimetable = async () => {
    if (!selectedBatch) return;

    setTableLoading(true);
    try {
      const res = await timetableService.getBatchTimetable(selectedBatch);
      setSlots(Array.isArray(res.data?.slots) ? res.data.slots : []);
    } catch (err) {
      console.error("Fetch timetable error:", err);
      setSlots([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBatch) {
      setSlots([]);
      return;
    }
    fetchTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  // ============================
  // ✅ FIX: Auto set course when batch changes
  // (If backend returns populated course in batch)
  // ============================
  useEffect(() => {
    if (!selectedBatch) return;

    const b = batches.find((x) => x._id === selectedBatch);
    const courseId = b?.course?._id || b?.course;

    if (courseId && courseId !== selectedCourse) {
      setSelectedCourse(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  // ============================
  // Day slots map
  // ============================
  const daySlots = useMemo(() => {
    const map = {};
    for (const d of DAYS) map[d.key] = [];

    for (const s of slots) {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    }

    for (const d of DAYS) {
      map[d.key].sort((a, b) => a.startMinutes - b.startMinutes);
    }

    return map;
  }, [slots]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h <= END_HOUR; h += 1) arr.push(h);
    return arr;
  }, []);

  const getSlotStyle = (slot) => {
    const dayStart = START_HOUR * 60;
    const start = clamp(slot.startMinutes, dayStart, END_HOUR * 60);
    const end = clamp(slot.endMinutes, dayStart, END_HOUR * 60);

    return {
      top: ((start - dayStart) / 60) * SLOT_HEIGHT,
      height: Math.max(((end - start) / 60) * SLOT_HEIGHT, 28),
    };
  };

  // ============================
  // Close popup on outside click
  // ============================
  useEffect(() => {
    if (!slotPopup.open) return;

    const onMouseDown = (e) => {
      if (!popupRef.current) return;
      if (!popupRef.current.contains(e.target)) {
        setSlotPopup({ open: false, x: 0, y: 0 });
        setSelectedSlot(null);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [slotPopup.open]);

  // ============================
  // Handlers
  // ============================
  const handleDayClick = (dayKey, e) => {
    if (!selectedBatch) return;

    setSlotPopup({ open: false, x: 0, y: 0 });
    setSelectedSlot(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const minutesFromStart = (y / SLOT_HEIGHT) * 60;
    const startMinutes =
      START_HOUR * 60 + Math.round(minutesFromStart / 30) * 30;

    setPrefillDay(dayKey);
    setPrefillStart(startMinutes);
    setOpenAddModal(true);
  };

  const handleSlotClick = (slot, e) => {
    e.stopPropagation();
    setSelectedSlot(slot);
    setSlotPopup({ open: true, x: e.clientX, y: e.clientY });
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot?._id) return;

    if (!window.confirm("Delete this timetable slot?")) return;

    try {
      setTableLoading(true);
      await timetableService.deleteSlot(selectedSlot._id);

      setSlotPopup({ open: false, x: 0, y: 0 });
      setSelectedSlot(null);

      await fetchTimetable();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete slot");
    } finally {
      setTableLoading(false);
    }
  };

  // ============================
  // UI
  // ============================
  if (loading) {
    return (
      <div className="p-8 text-center text-white/70">
        Loading timetable setup...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-[#101010] shadow-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Timetable</h1>
            <p className="text-sm text-white/50 mt-1">
              Select course → select batch → add slots. Click inside any day to
              quick-add in 30-minute steps.
            </p>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            disabled={!selectedBatch}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition
              ${
                selectedBatch
                  ? "bg-white text-black hover:bg-white/80"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-white/10 bg-[#101010] shadow-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-white/70">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mt-2 w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-[#141414] text-sm text-white outline-none"
          >
            <option value="">-- Select Course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-white/70">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={!selectedCourse || batchLoading}
            className="mt-2 w-full px-4 py-2.5 rounded-2xl border border-white/10 bg-[#141414] text-sm text-white outline-none disabled:opacity-60"
          >
            <option value="">
              {!selectedCourse
                ? "-- Select course first --"
                : batchLoading
                  ? "Loading batches..."
                  : "-- Select Batch --"}
            </option>

            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name || "Batch"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No batches warning */}
      {selectedCourse && !batchLoading && batches.length === 0 ? (
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-amber-200">
            No batches found for this course. Create a batch first before adding
            timetable slots.
          </p>

          <button
            onClick={() => navigate("/admin/batches")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 transition"
          >
            Go To Batches
            <ArrowRight size={15} />
          </button>
        </div>
      ) : null}

      {/* Empty state */}
      {!selectedBatch ? (
        <div className="rounded-3xl border border-white/10 p-12 text-center text-white/60 bg-[#101010] shadow-xl">
          Select a course and batch to view timetable.
        </div>
      ) : (
        <div className="relative">
          {/* Loading overlay */}
          {tableLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl">
              <div className="px-4 py-2 rounded-2xl bg-[#141414] border border-white/10 text-sm shadow-2xl flex items-center gap-2 text-white">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto border border-white/10 rounded-3xl bg-[#101010] shadow-2xl">
            <div className="min-w-[1100px]">
              {/* Header row */}
              <div className="grid grid-cols-8 sticky top-0 bg-[#101010] border-b border-white/10 z-20">
                <div className="p-3 text-xs font-semibold text-white/60">
                  Time
                </div>

                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="p-3 text-sm font-semibold text-white border-l border-white/10"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-8">
                {/* Time column */}
                <div className="border-r border-white/10 bg-[#0c0c0c]">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[56px] border-b border-white/10 px-3 py-2 text-[11px] text-white/50"
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                  ))}
                </div>

                {/* Days columns */}
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    onClick={(e) => handleDayClick(d.key, e)}
                    className="relative border-r border-white/10 cursor-pointer"
                    style={{
                      height: `${(END_HOUR - START_HOUR + 1) * SLOT_HEIGHT}px`,
                    }}
                  >
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-[56px] border-b border-white/10"
                      />
                    ))}

                    {/* Slots */}
                    {daySlots[d.key]?.map((s) => {
                      const style = getSlotStyle(s);
                      const roomLabel = getRoomLabel(s);

                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={(e) => handleSlotClick(s, e)}
                          className="absolute left-2 right-2 rounded-2xl p-2 text-[11px] shadow-lg border border-white/10 bg-[#141414] hover:bg-[#1b1b1b] transition"
                          style={style}
                        >
                          <p className="font-semibold text-white">
                            {minutesToTime(s.startMinutes)} -{" "}
                            {minutesToTime(s.endMinutes)}
                          </p>

                          <p className="text-white/60 mt-1 truncate">
                            {getTutorName(s)}
                          </p>

                          <p className="text-white/50 truncate">
                            {getCourseTitle(s)}
                          </p>

                          {roomLabel ? (
                            <p className="text-white/50 truncate">
                              Room: {roomLabel}
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-white/40 mt-2">
            Tip: Click inside any day column to quick-add a slot in 30-minute
            steps.
          </p>

          {/* Slot popup */}
          {slotPopup.open && selectedSlot && (
            <div
              ref={popupRef}
              className="fixed z-[9999] w-[340px] rounded-3xl border border-white/10 bg-[#101010] shadow-2xl"
              style={{
                left: Math.min(slotPopup.x, window.innerWidth - 360),
                top: Math.min(slotPopup.y, window.innerHeight - 240),
              }}
            >
              <div className="p-4 border-b border-white/10 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CalendarClock size={18} className="text-white/60 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {minutesToTime(selectedSlot.startMinutes)} -{" "}
                      {minutesToTime(selectedSlot.endMinutes)}
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      {selectedSlot.day?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSlotPopup({ open: false, x: 0, y: 0 });
                    setSelectedSlot(null);
                  }}
                  className="p-2 rounded-2xl border border-white/10 hover:bg-white/5 transition"
                >
                  <X size={16} className="text-white/70" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <p className="text-white/70">
                  Tutor:{" "}
                  <span className="font-semibold text-white">
                    {getTutorName(selectedSlot)}
                  </span>
                </p>

                <p className="text-white/70">
                  Course:{" "}
                  <span className="font-semibold text-white">
                    {getCourseTitle(selectedSlot)}
                  </span>
                </p>

                {selectedSlot.subject ? (
                  <p className="text-white/70">
                    Subject:{" "}
                    <span className="font-semibold text-white">
                      {selectedSlot.subject}
                    </span>
                  </p>
                ) : null}

                {getRoomLabel(selectedSlot) ? (
                  <p className="text-white/70">
                    Room:{" "}
                    <span className="font-semibold text-white">
                      {getRoomLabel(selectedSlot)}
                    </span>
                  </p>
                ) : null}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenEditModal(true);
                      setSlotPopup({ open: false, x: 0, y: 0 });
                    }}
                    className="flex-1 px-3 py-2 rounded-2xl bg-white text-black hover:bg-white/80 text-sm font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSlot}
                    className="flex-1 px-3 py-2 rounded-2xl border border-red-500/30 text-red-300 hover:bg-red-500/10 text-sm font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Slot Modal */}
      <AddTimetableSlotModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setPrefillDay("");
          setPrefillStart(null);
        }}
        batchId={selectedBatch}
        selectedCourseId={selectedCourse}
        prefillDay={prefillDay}
        prefillStartMinutes={prefillStart}
        onSuccess={async () => {
          await fetchTimetable();
          setOpenAddModal(false);
          setPrefillDay("");
          setPrefillStart(null);
        }}
      />

      {/* Edit Slot Modal */}
      <EditTimetableSlotModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedSlot(null);
        }}
        slot={selectedSlot}
        batchId={selectedBatch}
        selectedCourseId={selectedCourse}
        onSuccess={async () => {
          await fetchTimetable();
          setOpenEditModal(false);
          setSelectedSlot(null);
        }}
      />
    </div>
  );
};

export default AdminTimetable;
