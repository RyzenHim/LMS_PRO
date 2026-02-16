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

const getTutorName = (slot) => slot?.tutor?.employee?.name || slot?.tutor?.name || "Tutor";

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

  useEffect(() => {
    const fetchBatchesByCourse = async () => {
      if (!selectedCourse) {
        setBatches([]);
        setSelectedBatch("");
        return;
      }
      try {
        setBatchLoading(true);
        const res = await axiosInstance.get(`/batch/by-course/${selectedCourse}`);
        const rows = Array.isArray(res.data?.batches) ? res.data.batches : [];
        setBatches(rows);
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
  }, [selectedCourse]);

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
  }, [selectedBatch]);

  const daySlots = useMemo(() => {
    const map = {};
    for (const d of DAYS) map[d.key] = [];
    for (const s of slots) {
      if (!map[s.day]) map[s.day] = [];
      map[s.day].push(s);
    }
    for (const d of DAYS) map[d.key].sort((a, b) => a.startMinutes - b.startMinutes);
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

  const handleDayClick = (dayKey, e) => {
    if (!selectedBatch) return;
    setSlotPopup({ open: false, x: 0, y: 0 });
    setSelectedSlot(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutesFromStart = (y / SLOT_HEIGHT) * 60;
    const startMinutes = START_HOUR * 60 + Math.round(minutesFromStart / 30) * 30;
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

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading timetable setup...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl border border-white/40 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">Timetable</h1>
            <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
              Select course, then batch, then add slots. Course is auto-picked from batch.
            </p>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            disabled={!selectedBatch}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              selectedBatch
                ? "bg-[#3F72AF] text-white hover:bg-[#2f5d95]"
                : "bg-slate-300 text-slate-600 cursor-not-allowed"
            }`}
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
            Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm"
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
          <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            disabled={!selectedCourse || batchLoading}
            className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm disabled:opacity-60"
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

      {selectedCourse && !batchLoading && batches.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-amber-800">
            No batches found for this course. Create a batch first before adding timetable slots.
          </p>
          <button
            onClick={() => navigate("/admin/batches")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
          >
            Go To Batches
            <ArrowRight size={15} />
          </button>
        </div>
      ) : null}

      {!selectedBatch ? (
        <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 p-10 text-center text-[#3F72AF] dark:text-slate-300 bg-white/65 dark:bg-slate-900/55 backdrop-blur-md">
          Select a course and batch to view timetable.
        </div>
      ) : (
        <div className="relative">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/45 backdrop-blur-sm flex items-center justify-center z-30 rounded-xl">
              <div className="px-4 py-2 rounded-lg bg-white/85 dark:bg-slate-800/80 border border-[#DBE2EF] dark:border-slate-700 text-sm shadow-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </div>
            </div>
          )}

          <div className="overflow-x-auto border border-[#DBE2EF] dark:border-slate-700 rounded-xl bg-white/80 dark:bg-slate-900/65 backdrop-blur-xl shadow-sm">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-8 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-[#DBE2EF] dark:border-slate-700 z-20">
                <div className="p-3 text-xs font-semibold text-[#3F72AF] dark:text-slate-300">
                  Time
                </div>
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="p-3 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] border-l border-[#DBE2EF] dark:border-slate-700"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-8">
                <div className="border-r border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7]/80 dark:bg-slate-800/60">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[56px] border-b border-[#DBE2EF] dark:border-slate-700 px-3 py-2 text-[11px] text-[#3F72AF] dark:text-slate-300"
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                  ))}
                </div>

                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    onClick={(e) => handleDayClick(d.key, e)}
                    className="relative border-r border-[#DBE2EF] dark:border-slate-700 cursor-pointer"
                    style={{ height: `${(END_HOUR - START_HOUR + 1) * SLOT_HEIGHT}px` }}
                  >
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-[56px] border-b border-[#DBE2EF] dark:border-slate-700"
                      />
                    ))}

                    {daySlots[d.key]?.map((s) => {
                      const style = getSlotStyle(s);
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={(e) => handleSlotClick(s, e)}
                          className="absolute left-2 right-2 rounded-xl p-2 text-[11px] shadow-md border border-[#3F72AF]/40 bg-[#DBE2EF]/90 dark:bg-slate-800/90 backdrop-blur-md hover:shadow-lg transition"
                          style={style}
                        >
                          <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                            {minutesToTime(s.startMinutes)} - {minutesToTime(s.endMinutes)}
                          </p>
                          <p className="text-[#3F72AF] dark:text-slate-300 mt-1 truncate">
                            {getTutorName(s)}
                          </p>
                          <p className="text-[#3F72AF] dark:text-slate-300 truncate">
                            {s.course?.title || "Course"}
                          </p>
                          {s.room ? (
                            <p className="text-[#3F72AF] dark:text-slate-300 truncate">
                              Room: {s.room}
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

          <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-2">
            Tip: click inside any day column to quick-add a slot in 30-minute steps.
          </p>

          {slotPopup.open && selectedSlot && (
            <div
              ref={popupRef}
              className="fixed z-[9999] w-[320px] rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl"
              style={{
                left: Math.min(slotPopup.x, window.innerWidth - 340),
                top: Math.min(slotPopup.y, window.innerHeight - 220),
              }}
            >
              <div className="p-4 border-b border-[#DBE2EF] dark:border-slate-700 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CalendarClock size={18} className="text-[#3F72AF] dark:text-[#DBE2EF] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                      {minutesToTime(selectedSlot.startMinutes)} -{" "}
                      {minutesToTime(selectedSlot.endMinutes)}
                    </p>
                    <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-1">
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
                  className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800"
                >
                  <X size={16} className="text-[#112D4E] dark:text-[#DBE2EF]" />
                </button>
              </div>

              <div className="p-4 space-y-3 text-sm">
                <p className="text-[#112D4E] dark:text-[#DBE2EF]">
                  Tutor: <span className="font-medium">{getTutorName(selectedSlot)}</span>
                </p>
                <p className="text-[#112D4E] dark:text-[#DBE2EF]">
                  Course: <span className="font-medium">{selectedSlot.course?.title || "-"}</span>
                </p>
                {selectedSlot.subject ? (
                  <p className="text-[#112D4E] dark:text-[#DBE2EF]">
                    Subject: <span className="font-medium">{selectedSlot.subject}</span>
                  </p>
                ) : null}
                {selectedSlot.room ? (
                  <p className="text-[#112D4E] dark:text-[#DBE2EF]">
                    Room: <span className="font-medium">{selectedSlot.room}</span>
                  </p>
                ) : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenEditModal(true);
                      setSlotPopup({ open: false, x: 0, y: 0 });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm flex items-center justify-center gap-2"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSlot}
                    className="flex-1 px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm flex items-center justify-center gap-2"
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
