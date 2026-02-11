import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, CalendarClock, Loader2 } from "lucide-react";
import axiosInstance from "../../api/axios";
import { timetableService } from "../../../src/services/timetableService";
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

// Google calendar feel
const SLOT_HEIGHT = 56;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const minutesToTime = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;

  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h >= 12 ? "PM" : "AM";

  return `${hour12}:${String(min).padStart(2, "0")} ${ampm}`;
};

const AdminTimetable = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Quick add
  const [prefillDay, setPrefillDay] = useState("");
  const [prefillStart, setPrefillStart] = useState(null);

  // Selected slot popup (Google style)
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotPopup, setSlotPopup] = useState({
    open: false,
    x: 0,
    y: 0,
  });

  const popupRef = useRef(null);

  // =========================
  // FETCH BATCHES
  // =========================
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await axiosInstance.get("/batch/all");
        setBatches(res.data.batches || []);
      } catch (err) {
        console.error("Fetch batches error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  // =========================
  // FETCH TIMETABLE
  // =========================
  const fetchTimetable = async () => {
    if (!selectedBatch) return;

    setTableLoading(true);

    try {
      const res = await timetableService.getBatchTimetable(selectedBatch);
      setSlots(res.data?.slots || []);
    } catch (err) {
      console.error("Fetch timetable error:", err);
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

  // =========================
  // GROUP BY DAY
  // =========================
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

  // =========================
  // HOURS LIST
  // =========================
  const hours = useMemo(() => {
    const arr = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) arr.push(h);
    return arr;
  }, []);

  // =========================
  // SLOT STYLE
  // =========================
  const getSlotStyle = (slot) => {
    const dayStart = START_HOUR * 60;

    const start = clamp(slot.startMinutes, dayStart, END_HOUR * 60);
    const end = clamp(slot.endMinutes, dayStart, END_HOUR * 60);

    const top = ((start - dayStart) / 60) * SLOT_HEIGHT;
    const height = Math.max(((end - start) / 60) * SLOT_HEIGHT, 28);

    return { top, height };
  };

  // =========================
  // CLOSE SLOT POPUP (outside click)
  // =========================
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

  // =========================
  // CLICK EMPTY GRID (QUICK ADD)
  // =========================
  const handleDayClick = (dayKey, e) => {
    if (!selectedBatch) return;

    // close any open popup
    setSlotPopup({ open: false, x: 0, y: 0 });
    setSelectedSlot(null);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const minutesFromStart = (y / SLOT_HEIGHT) * 60;
    const snappedMinutes = Math.round(minutesFromStart / 30) * 30;

    const startMinutes = START_HOUR * 60 + snappedMinutes;

    setPrefillDay(dayKey);
    setPrefillStart(startMinutes);
    setOpenAddModal(true);
  };

  // =========================
  // SLOT CLICK (OPEN POPUP)
  // =========================
  const handleSlotClick = (slot, e) => {
    e.stopPropagation();

    // place popup near cursor
    const x = e.clientX;
    const y = e.clientY;

    setSelectedSlot(slot);
    setSlotPopup({ open: true, x, y });
  };

  // =========================
  // DELETE SLOT
  // =========================
  const handleDeleteSlot = async () => {
    if (!selectedSlot?._id) return;

    const ok = window.confirm("Delete this timetable slot?");
    if (!ok) return;

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

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Timetable
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Calendar (Batch based)
          </p>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          disabled={!selectedBatch}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors ${
            selectedBatch
              ? "bg-[#3F72AF] text-white hover:bg-[#112D4E]"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          <Plus size={18} />
          Add Slot
        </button>
      </div>

      {/* BATCH SELECT */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 shadow-sm">
        <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
          Select Batch
        </label>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="mt-2 w-full px-3 py-2 rounded-lg border bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">-- Select --</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name || b.title || "Batch"}
            </option>
          ))}
        </select>
      </div>

      {/* EMPTY */}
      {!selectedBatch ? (
        <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
          Select a batch to view timetable.
        </div>
      ) : (
        <div className="relative">
          {/* TABLE LOADER */}
          {tableLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center z-30 rounded-xl">
              <div className="px-4 py-2 rounded-lg bg-white dark:bg-[#112D4E] border border-[#DBE2EF] dark:border-[#3F72AF] text-sm shadow-lg flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </div>
            </div>
          )}

          {/* WEEK GRID */}
          <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl bg-white dark:bg-[#112D4E] shadow-sm">
            <div className="min-w-[1100px]">
              {/* HEADER */}
              <div className="grid grid-cols-8 sticky top-0 bg-white dark:bg-[#112D4E] z-20 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <div className="p-3 text-xs font-semibold text-[#3F72AF] dark:text-[#DBE2EF]">
                  Time
                </div>

                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    className="p-3 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] border-l border-[#DBE2EF] dark:border-[#3F72AF]"
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              {/* BODY */}
              <div className="grid grid-cols-8">
                {/* TIME COLUMN */}
                <div className="border-r border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
                  {hours.map((h) => (
                    <div
                      key={h}
                      className="h-[56px] border-b border-[#DBE2EF] dark:border-[#3F72AF] px-3 py-2 text-[11px] text-[#3F72AF] dark:text-[#DBE2EF]"
                    >
                      {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                  ))}
                </div>

                {/* DAY COLUMNS */}
                {DAYS.map((d) => (
                  <div
                    key={d.key}
                    onClick={(e) => handleDayClick(d.key, e)}
                    className="relative border-r border-[#DBE2EF] dark:border-[#3F72AF] cursor-pointer"
                    style={{
                      height: `${(END_HOUR - START_HOUR + 1) * SLOT_HEIGHT}px`,
                    }}
                  >
                    {/* Hour lines */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="h-[56px] border-b border-[#DBE2EF] dark:border-[#3F72AF]"
                      />
                    ))}

                    {/* SLOTS */}
                    {daySlots[d.key]?.map((s) => {
                      const style = getSlotStyle(s);

                      return (
                        <button
                          key={s._id}
                          type="button"
                          onClick={(e) => handleSlotClick(s, e)}
                          className="absolute left-2 right-2 rounded-xl p-2 text-[11px] shadow-md border border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#0a1f3a] hover:shadow-lg transition-shadow text-left"
                          style={style}
                        >
                          <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                            {minutesToTime(s.startMinutes)} -{" "}
                            {minutesToTime(s.endMinutes)}
                          </p>

                          <p className="text-[#3F72AF] dark:text-[#DBE2EF] mt-1 truncate">
                            {s.tutor?.name || "Tutor"}
                          </p>

                          <p className="text-[#3F72AF] dark:text-[#DBE2EF] truncate">
                            {s.course?.title || "Course"}
                          </p>

                          {s.room ? (
                            <p className="text-[#3F72AF] dark:text-[#DBE2EF] truncate">
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

          {/* Tip */}
          <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-2">
            Tip: Click inside any day column to quickly add a slot (30 min
            snap).
          </p>

          {/* SLOT POPUP (Google style) */}
          {slotPopup.open && selectedSlot && (
            <div
              ref={popupRef}
              className="fixed z-[9999] w-[320px] rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] shadow-2xl"
              style={{
                left: Math.min(slotPopup.x, window.innerWidth - 340),
                top: Math.min(slotPopup.y, window.innerHeight - 220),
              }}
            >
              <div className="p-4 border-b border-[#DBE2EF] dark:border-[#3F72AF] flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <CalendarClock
                      size={18}
                      className="text-[#3F72AF] dark:text-[#DBE2EF]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                      {minutesToTime(selectedSlot.startMinutes)} -{" "}
                      {minutesToTime(selectedSlot.endMinutes)}
                    </p>

                    <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
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
                  className="p-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                >
                  <X size={16} className="text-[#112D4E] dark:text-[#DBE2EF]" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-sm">
                  <p className="text-[#112D4E] dark:text-[#DBE2EF] font-medium truncate">
                    Tutor:{" "}
                    <span className="font-normal">
                      {selectedSlot.tutor?.name || "Tutor"}
                    </span>
                  </p>

                  <p className="text-[#112D4E] dark:text-[#DBE2EF] font-medium truncate mt-1">
                    Course:{" "}
                    <span className="font-normal">
                      {selectedSlot.course?.title || "Course"}
                    </span>
                  </p>

                  {selectedSlot.subject ? (
                    <p className="text-[#112D4E] dark:text-[#DBE2EF] font-medium truncate mt-1">
                      Subject:{" "}
                      <span className="font-normal">
                        {selectedSlot.subject}
                      </span>
                    </p>
                  ) : null}

                  {selectedSlot.room ? (
                    <p className="text-[#112D4E] dark:text-[#DBE2EF] font-medium truncate mt-1">
                      Room:{" "}
                      <span className="font-normal">{selectedSlot.room}</span>
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenEditModal(true);
                      setSlotPopup({ open: false, x: 0, y: 0 });
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm flex items-center justify-center gap-2"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSlot}
                    className="flex-1 px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD MODAL */}
      <AddTimetableSlotModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setPrefillDay("");
          setPrefillStart(null);
        }}
        batchId={selectedBatch}
        prefillDay={prefillDay}
        prefillStartMinutes={prefillStart}
        onSuccess={async () => {
          await fetchTimetable();
          setOpenAddModal(false);
          setPrefillDay("");
          setPrefillStart(null);
        }}
      />

      {/* EDIT MODAL */}
      <EditTimetableSlotModal
        open={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedSlot(null);
        }}
        slot={selectedSlot}
        batchId={selectedBatch}
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
