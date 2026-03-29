import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
  Loader2,
  ArrowRight,
  Sparkles,
  Clock3,
  LayoutGrid,
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { timetableService } from "../../services/timetableService";
import AddTimetableSlotModal from "./modal/timeTaable/AddTimetableSlotModal";
import EditTimetableSlotModal from "./modal/timeTaable/EditTimetableSlotModal";
import PageLoader from "../../components/ui/PageLoader";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  useEffect(() => {
    if (!selectedBatch) return;
    const batch = batches.find((x) => x._id === selectedBatch);
    const courseId = batch?.course?._id || batch?.course;
    if (courseId && courseId !== selectedCourse) {
      setSelectedCourse(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (loading) {
    return (
      <div className="lms-page-enter">
        <PageLoader label="Loading" detail="Preparing timetable workspace" />
      </div>
    );
  }

  return (
    <div className="lms-page-enter space-y-6">
      <section className="neu-panel lms-card-hover lms-sheen rounded-[34px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--lms-accent-soft)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-accent-strong)]">
              <Sparkles size={14} />
              Schedule Studio
            </div>
            <h1 className="text-3xl font-semibold text-[var(--lms-text)]">
              Timetable
            </h1>
            <p className="max-w-2xl text-sm text-[var(--lms-text-soft)]">
              Select a course, choose a batch, and place slots directly on the
              grid with a calmer neumorphic planning surface.
            </p>
          </div>

          <button
            onClick={() => setOpenAddModal(true)}
            disabled={!selectedBatch}
            className="neu-button neu-button-primary rounded-[24px] px-5 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <Plus size={16} />
            Add Slot
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Courses", value: courses.length, icon: LayoutGrid },
            { label: "Batches", value: batches.length, icon: CalendarClock },
            { label: "Visible Slots", value: slots.length, icon: Clock3 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="neu-panel-soft rounded-[28px] p-4">
                <div className="flex items-center gap-3">
                  <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
                    <Icon size={18} className="text-[var(--lms-accent-strong)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--lms-text)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--lms-text)]">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="neu-input w-full rounded-[22px] px-4 py-3 text-sm"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--lms-text)]">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              disabled={!selectedCourse || batchLoading}
              className="neu-input w-full rounded-[22px] px-4 py-3 text-sm disabled:opacity-60"
            >
              <option value="">
                {!selectedCourse
                  ? "Select course first"
                  : batchLoading
                    ? "Loading batches..."
                    : "Select Batch"}
              </option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name || "Batch"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {selectedCourse && !batchLoading && batches.length === 0 ? (
        <div className="neu-panel rounded-[28px] p-5">
          <div className="lms-status-warning flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm">
              No batches found for this course. Create a batch first before
              adding timetable slots.
            </p>
            <button
              onClick={() => navigate("/admin/batches")}
              className="neu-button rounded-[18px] px-4 py-2 text-sm font-semibold"
            >
              Go To Batches
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {!selectedBatch ? (
        <div className="neu-panel rounded-[34px] p-10 text-center">
          <div className="neu-inset rounded-[28px] px-6 py-16">
            <p className="text-base font-medium text-[var(--lms-text)]">
              Select a course and batch to view timetable.
            </p>
            <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
              Click any day column once a batch is selected to quick-add slots in
              30-minute steps.
            </p>
          </div>
        </div>
      ) : (
        <section className="neu-panel relative overflow-hidden rounded-[34px] p-4">
          {tableLoading ? (
            <div className="lms-modal-backdrop absolute inset-0 z-20 flex items-center justify-center rounded-[30px]">
              <div className="neu-panel-soft flex items-center gap-3 rounded-[22px] px-5 py-4 text-sm font-medium text-[var(--lms-text)]">
                <Loader2 size={16} className="animate-spin" />
                Loading timetable...
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <div className="min-w-[1120px]">
              <div className="grid grid-cols-8 gap-3">
                <div className="neu-panel-soft rounded-[24px] p-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                  Time
                </div>
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="neu-panel-soft rounded-[24px] p-3 text-sm font-semibold text-[var(--lms-text)]"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-8 gap-3">
                <div className="space-y-3">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="neu-panel-soft flex h-[56px] items-start rounded-[20px] px-3 py-2 text-[11px] font-medium text-[var(--lms-text-soft)]"
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                  ))}
                </div>

                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    onClick={(e) => handleDayClick(d.key, e)}
                    className="neu-panel-soft relative cursor-pointer rounded-[26px] p-2"
                    style={{
                      height: `${(END_HOUR - START_HOUR + 1) * SLOT_HEIGHT + 8}px`,
                    }}
                  >
                    <div className="absolute inset-2 overflow-hidden rounded-[22px]">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="border-b border-white/40 last:border-b-0"
                          style={{ height: `${SLOT_HEIGHT}px` }}
                        />
                      ))}
                    </div>

                    {daySlots[d.key]?.map((s) => {
                      const style = getSlotStyle(s);
                      const roomLabel = getRoomLabel(s);
                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={(e) => handleSlotClick(s, e)}
                          className="neu-button absolute left-3 right-3 rounded-[20px] px-3 py-2 text-left text-[11px] transition hover:-translate-y-0.5"
                          style={style}
                        >
                          <p className="font-semibold text-[var(--lms-text)]">
                            {minutesToTime(s.startMinutes)} - {minutesToTime(s.endMinutes)}
                          </p>
                          <p className="mt-1 truncate text-[var(--lms-text-soft)]">
                            {getTutorName(s)}
                          </p>
                          <p className="truncate text-[var(--lms-text-soft)]">
                            {getCourseTitle(s)}
                          </p>
                          {roomLabel ? (
                            <p className="truncate text-[var(--lms-accent-strong)]/80">
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

          <p className="mt-4 text-xs text-[var(--lms-text-soft)]">
            Tip: click inside a day column to quick-add a slot aligned to the
            nearest 30-minute step.
          </p>

          {slotPopup.open && selectedSlot ? (
            <div
              ref={popupRef}
              className="neu-panel fixed z-[9999] w-[340px] rounded-[30px] p-5"
              style={{
                left: Math.min(slotPopup.x, window.innerWidth - 360),
                top: Math.min(slotPopup.y, window.innerHeight - 260),
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="neu-inset flex h-11 w-11 items-center justify-center rounded-[18px]">
                    <CalendarClock size={18} className="text-[var(--lms-accent-strong)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--lms-text)]">
                      {minutesToTime(selectedSlot.startMinutes)} -{" "}
                      {minutesToTime(selectedSlot.endMinutes)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
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
                  className="neu-button h-10 w-10 rounded-[16px]"
                >
                  x
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[var(--lms-text-soft)]">
                <p>
                  Tutor:{" "}
                  <span className="font-semibold text-[var(--lms-text)]">
                    {getTutorName(selectedSlot)}
                  </span>
                </p>
                <p>
                  Course:{" "}
                  <span className="font-semibold text-[var(--lms-text)]">
                    {getCourseTitle(selectedSlot)}
                  </span>
                </p>
                {selectedSlot.subject ? (
                  <p>
                    Subject:{" "}
                    <span className="font-semibold text-[var(--lms-text)]">
                      {selectedSlot.subject}
                    </span>
                  </p>
                ) : null}
                {getRoomLabel(selectedSlot) ? (
                  <p>
                    Room:{" "}
                    <span className="font-semibold text-[var(--lms-text)]">
                      {getRoomLabel(selectedSlot)}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEditModal(true);
                    setSlotPopup({ open: false, x: 0, y: 0 });
                  }}
                  className="neu-button neu-button-primary flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSlot}
                  className="neu-button-danger flex-1 rounded-[18px] px-4 py-3 text-sm font-semibold"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          ) : null}
        </section>
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
