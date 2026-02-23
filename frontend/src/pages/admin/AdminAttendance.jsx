import React, { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "../../api/axios";
import { attendanceService } from "../../services/attendanceService";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  RefreshCcw,
  Wifi,
  Save,
  ChevronRight,
  AlertCircle,
  Clock,
  TrendingDown,
  BookMarked,
  CalendarDays,
  Sun,
  Award,
  AlertTriangle,
  X,
} from "lucide-react";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

// ─────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────
const ATTENDANCE_STATUSES = ["present", "present-online", "absent"];

const STATUS_CONFIG = {
  present: {
    label: "Present",
    shortLabel: "P",
    icon: CheckCircle2,
    activeBtn: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700 dark:hover:text-emerald-300",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
    rowBg: "bg-emerald-50/40 dark:bg-emerald-900/5",
  },
  "present-online": {
    label: "Online",
    shortLabel: "O",
    icon: Wifi,
    activeBtn: "bg-blue-600 text-white border-blue-600 shadow-sm",
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 dark:hover:text-blue-300",
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
    rowBg: "bg-blue-50/40 dark:bg-blue-900/5",
  },
  absent: {
    label: "Absent",
    shortLabel: "A",
    icon: XCircle,
    activeBtn: "bg-red-600 text-white border-red-600 shadow-sm",
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-300",
    pill: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    dot: "bg-red-500",
    rowBg: "bg-red-50/30 dark:bg-red-900/5",
  },
};

const HOLIDAY_TYPE_CONFIG = {
  "public-holiday": {
    label: "Public Holiday",
    color:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
  },
  exam: {
    label: "Exam",
    color:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
  },
  event: {
    label: "Event",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  },
  other: {
    label: "Other",
    color:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600",
  },
};

const getCalendarDayStyle = (calData) => {
  if (!calData)
    return {
      bg: "bg-slate-100 dark:bg-slate-700/50",
      text: "text-slate-500 dark:text-slate-400",
    };
  if (calData.isHoliday)
    return {
      bg: "bg-rose-100 dark:bg-rose-900/40",
      text: "text-rose-600 dark:text-rose-400",
    };
  if (!calData.attendanceMarked)
    return {
      bg: "bg-slate-100 dark:bg-slate-700/50",
      text: "text-slate-400 dark:text-slate-500",
    };
  if (calData.fullAttendance)
    return { bg: "bg-emerald-500", text: "text-white" };
  if (calData.presentPercent >= 75)
    return {
      bg: "bg-emerald-200 dark:bg-emerald-800/60",
      text: "text-emerald-800 dark:text-emerald-300",
    };
  if (calData.presentPercent >= 50)
    return {
      bg: "bg-amber-200 dark:bg-amber-800/40",
      text: "text-amber-800 dark:text-amber-300",
    };
  return {
    bg: "bg-red-200 dark:bg-red-900/40",
    text: "text-red-800 dark:text-red-300",
  };
};

const computeCalendarDates = (batch, timetableSlots) => {
  if (!batch?.startDate || !timetableSlots?.length) return [];

  const start = dayjs(batch.startDate);
  const end = batch.endDate ? dayjs(batch.endDate) : dayjs();

  const hasSlotOnWeekday = {};
  timetableSlots.forEach((slot) => {
    hasSlotOnWeekday[slot.day] = true;
  });

  const dates = [];
  let cur = start;
  while (cur.isSameOrBefore(end, "day")) {
    const weekday = cur.format("ddd").toLowerCase().slice(0, 3);
    if (hasSlotOnWeekday[weekday]) {
      dates.push(cur.format("YYYY-MM-DD"));
    }
    cur = cur.add(1, "day");
  }
  return dates;
};

// ── Sub-components ──
const StatCard = ({ label, value, sub, color }) => (
  <div className={`rounded-2xl border p-4 ${color}`}>
    <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
  </div>
);

const PctBar = ({ pct, atRisk }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${atRisk ? "bg-red-500" : pct >= 75 ? "bg-emerald-500" : "bg-amber-500"}`}
        style={{ width: `${Math.max(pct, 0)}%` }}
      />
    </div>
    <span
      className={`text-xs font-bold w-9 text-right tabular-nums ${
        atRisk
          ? "text-red-600 dark:text-red-400"
          : pct >= 75
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-amber-600 dark:text-amber-400"
      }`}
    >
      {pct}%
    </span>
  </div>
);

const modalInputCls =
  "w-full rounded-xl border border-slate-600/60 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/60 transition";

const modalSelectCls =
  "w-full rounded-xl border border-slate-600/60 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-[#3F72AF]/60 transition";

const AddHolidayModal = ({
  open,
  batchId,
  date,
  existingHoliday,
  onClose,
  onSuccess,
}) => {
  const [label, setLabel] = useState("");
  const [type, setType] = useState("public-holiday");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLabel(existingHoliday?.label || "");
    setType(existingHoliday?.type || "public-holiday");
    setError("");
  }, [open, existingHoliday]);

  if (!open) return null;

  const handleSave = async () => {
    if (!label.trim()) {
      setError("Holiday label is required");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await axiosInstance.post(`/holidays/batch/${batchId}`, {
        date,
        label: label.trim(),
        type,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save holiday");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existingHoliday) return;
    try {
      setSaving(true);
      await axiosInstance.delete(`/holidays/${existingHoliday._id}`);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-[#0f172a] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sun size={18} className="text-rose-400" />
            <h3 className="text-base font-bold text-white">
              {existingHoliday ? "Edit Holiday" : "Mark as Holiday"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Date:{" "}
          <span className="text-slate-200 font-semibold">
            {dayjs(date).format("DD MMM YYYY, dddd")}
          </span>
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Diwali, Republic Day, Exam Day"
              className={modalInputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={modalSelectCls}
            >
              <option value="public-holiday">Public Holiday</option>
              <option value="exam">Exam</option>
              <option value="event">Event</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          {existingHoliday && (
            <button
              onClick={handleRemove}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-red-700/50 text-sm font-semibold text-red-400 hover:bg-red-900/20 disabled:opacity-50 transition"
            >
              Remove
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-slate-600 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState("mark");

  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceMap, setAttendanceMap] = useState({});
  const [dateHoliday, setDateHoliday] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const [calendarDates, setCalendarDates] = useState([]);

  const [holidayModal, setHolidayModal] = useState({
    open: false,
    date: "",
    existing: null,
  });

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [error, setError] = useState("");

  const THRESHOLD = 75;

  const selectCls =
    "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

  // ── Fetch courses ──
  useEffect(() => {
    axiosInstance
      .get("/courses/all")
      .then((res) => {
        const l = res.data?.courses || res.data || [];
        setCourses(Array.isArray(l) ? l : []);
      })
      .catch(() => setError("Failed to load courses"))
      .finally(() => setLoadingCourses(false));
  }, []);

  // ── Fetch batches ──
  useEffect(() => {
    if (!selectedCourse) {
      setBatches([]);
      setSelectedBatch(null);
      return;
    }
    setLoadingBatches(true);
    axiosInstance
      .get(`/batch/by-course/${selectedCourse}`)
      .then((res) => setBatches(res.data?.batches || []))
      .catch(() => setError("Failed to load batches"))
      .finally(() => setLoadingBatches(false));
  }, [selectedCourse]);

  // ── Fetch students ──
  const fetchStudents = useCallback(async (batchId) => {
    try {
      setLoadingStudents(true);
      const res = await attendanceService.getBatchStudents(batchId);
      setStudents(res.data?.students || []);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // ── Fetch attendance for a date ──
  const fetchAttendance = useCallback(async ({ batchId, date }) => {
    try {
      setLoadingAttendance(true);
      setDateHoliday(null);
      const res = await attendanceService.getAttendanceByDate(batchId, date);
      const map = {};
      (res.data?.records || []).forEach((r) => {
        const sid = typeof r.student === "object" ? r.student?._id : r.student;
        if (sid) map[sid] = r.status;
      });
      setAttendanceMap(map);
      setDateHoliday(res.data?.holiday || null);
    } catch (err) {
      setAttendanceMap({});
      setDateHoliday(err?.response?.data?.holiday || null);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // ── Fetch dashboard ──
  const fetchDashboard = useCallback(async (batchId) => {
    try {
      setLoadingDashboard(true);
      const res = await attendanceService.getBatchDashboard(batchId, THRESHOLD);
      setDashboard(res.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // ── Select batch + load slots + filter dates ──
  const handleSelectBatch = async (batch) => {
    setSelectedBatch(batch);
    setSelectedDate("");
    setAttendanceMap({});
    setStudents([]);
    setDashboard(null);
    setSaveSuccess(false);
    setError("");

    await fetchStudents(batch._id);

    let slots = [];
    try {
      const res = await axiosInstance.get(`/timetable/batch/${batch._id}`);
      slots = res.data?.slots || [];
    } catch (err) {
      console.warn("Could not load timetable slots for calendar", err);
    }

    const filteredDates = computeCalendarDates(batch, slots);
    setCalendarDates(filteredDates);

    const today = dayjs().format("YYYY-MM-DD");
    let defaultDate = filteredDates.includes(today)
      ? today
      : filteredDates[0] || "";

    if (defaultDate) {
      setSelectedDate(defaultDate);
      await Promise.all([
        fetchAttendance({ batchId: batch._id, date: defaultDate }),
        fetchDashboard(batch._id),
      ]);
    } else if (filteredDates.length === 0) {
      setError(
        "No timetable slots found for this batch. Attendance can only be marked on scheduled days.",
      );
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (
      (tab === "register" || tab === "students") &&
      selectedBatch &&
      !dashboard
    ) {
      fetchDashboard(selectedBatch._id);
    }
  };

  const handleSelectDate = async (date) => {
    if (!selectedBatch?._id || !date) return;
    setSelectedDate(date);
    setSaveSuccess(false);
    await fetchAttendance({ batchId: selectedBatch._id, date });
  };

  const setStudentStatus = useCallback((studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  }, []);

  const markAll = useCallback(
    (status) => {
      const map = {};
      students.forEach((s) => (map[s._id] = status));
      setAttendanceMap(map);
    },
    [students],
  );

  const handleSave = async () => {
    if (!selectedBatch?._id || !selectedDate) return;
    if (dateHoliday) {
      setError(`Cannot save attendance on holiday: "${dateHoliday.label}"`);
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);
      setError("");

      await attendanceService.markAttendance(selectedBatch._id, {
        date: selectedDate,
        records: students.map((s) => ({
          student: s._id,
          status: attendanceMap[s._id] || "absent",
        })),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchDashboard(selectedBatch._id);
      fetchAttendance({ batchId: selectedBatch._id, date: selectedDate });
    } catch (err) {
      console.error("Save error:", err);
      setError(err?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const openHolidayModal = (date) => {
    const existing = dashboard?.holidays?.find((h) => h.date === date) || null;
    setHolidayModal({ open: true, date, existing });
  };

  const handleHolidaySuccess = async () => {
    if (!selectedBatch) return;
    await fetchDashboard(selectedBatch._id);
    if (selectedDate)
      fetchAttendance({ batchId: selectedBatch._id, date: selectedDate });
  };

  const markStats = useMemo(() => {
    let present = 0,
      online = 0,
      absent = 0,
      unmarked = 0;
    students.forEach((s) => {
      const st = attendanceMap[s._id];
      if (st === "present") present++;
      else if (st === "present-online") online++;
      else if (st === "absent") absent++;
      else unmarked++;
    });
    return { present, online, absent, unmarked, total: students.length };
  }, [students, attendanceMap]);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  if (loadingCourses) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading attendance module...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5 max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20">
              <CalendarCheck2 size={20} className="text-[#3F72AF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Attendance
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track, analyse, and manage student attendance
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:w-[560px]">
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedBatch(null);
              }}
              className={selectCls}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
            {selectedCourse && (
              <select
                value={selectedBatch?._id || ""}
                onChange={(e) => {
                  const b = batches.find((x) => x._id === e.target.value);
                  if (b) handleSelectBatch(b);
                }}
                className={selectCls}
                disabled={loadingBatches}
              >
                <option value="">
                  {loadingBatches ? "Loading..." : "Select Batch"}
                </option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={15} className="shrink-0" />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto text-red-400 hover:text-red-600 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* BATCH PICKER (no batch selected) */}
      {!selectedBatch && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-[#3F72AF]" />
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Batches
            </h2>
          </div>

          {!selectedCourse ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
              Select a course above to view its batches
            </p>
          ) : loadingBatches ? (
            <div className="flex items-center gap-2 py-8 justify-center text-sm text-slate-400">
              <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />{" "}
              Loading batches...
            </div>
          ) : batches.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              No batches found for this course
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {batches.map((b) => (
                <button
                  key={b._id}
                  onClick={() => handleSelectBatch(b)}
                  className="text-left rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-[#3F72AF] hover:bg-[#3F72AF]/5 dark:hover:bg-[#3F72AF]/10 p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {b.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {dayjs(b.startDate).format("DD MMM YYYY")} →{" "}
                        {b.endDate
                          ? dayjs(b.endDate).format("DD MMM YYYY")
                          : "ongoing"}
                      </p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shrink-0">
                      <GraduationCap size={16} className="text-[#3F72AF]" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        b.status === "running"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                          : b.status === "completed"
                            ? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                      }`}
                    >
                      {b.status || "upcoming"}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"
                      }`}
                    >
                      {b.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#3F72AF]">
                    Open attendance <ChevronRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN PANEL (batch selected) */}
      {selectedBatch && (
        <>
          {/* Batch banner + tabs */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setSelectedCourse("");
                    setBatches([]);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Back"
                >
                  <X size={15} />
                </button>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">
                    {selectedBatch.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dayjs(selectedBatch.startDate).format("DD MMM YYYY")} →{" "}
                    {selectedBatch.endDate
                      ? dayjs(selectedBatch.endDate).format("DD MMM YYYY")
                      : "ongoing"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[
                  { key: "mark", label: "Mark", icon: CalendarCheck2 },
                  { key: "register", label: "Register", icon: BookMarked },
                  { key: "students", label: "Students", icon: Users },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => handleTabChange(t.key)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        activeTab === t.key
                          ? "bg-[#3F72AF] text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {dashboard && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <StatCard
                  label="Working Days"
                  value={dashboard.summary.workingDays}
                  sub={`${dashboard.summary.holidayCount} holiday${dashboard.summary.holidayCount !== 1 ? "s" : ""}`}
                  color="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                />
                <StatCard
                  label="Days Marked"
                  value={dashboard.summary.markedDays}
                  sub={`of ${dashboard.summary.workingDays} working days`}
                  color="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                />
                <StatCard
                  label="Full Attendance"
                  value={dashboard.summary.fullAttendanceDays}
                  sub="all students present"
                  color="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                />
                <StatCard
                  label="At-Risk Students"
                  value={dashboard.summary.atRiskStudents}
                  sub={`below ${THRESHOLD}%`}
                  color={
                    dashboard.summary.atRiskStudents > 0
                      ? "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  }
                />
              </div>
            )}
          </div>

          {/* TAB: MARK */}
          {activeTab === "mark" && (
            <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-5">
              {/* Calendar sidebar */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-[#3F72AF]" />
                    <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Calendar
                    </h3>
                  </div>
                  <button
                    onClick={() =>
                      selectedBatch &&
                      selectedDate &&
                      fetchAttendance({
                        batchId: selectedBatch._id,
                        date: selectedDate,
                      })
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition"
                    title="Refresh"
                  >
                    <RefreshCcw size={13} />
                  </button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-700/60">
                  {[
                    { bg: "bg-emerald-500", label: "100%" },
                    { bg: "bg-emerald-200 dark:bg-emerald-800", label: "≥75%" },
                    { bg: "bg-amber-200 dark:bg-amber-700", label: "≥50%" },
                    { bg: "bg-red-200 dark:bg-red-900", label: "<50%" },
                    { bg: "bg-rose-100 dark:bg-rose-900", label: "Holiday" },
                    { bg: "bg-slate-100 dark:bg-slate-700", label: "Pending" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-sm ${l.bg}`} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {l.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 max-h-[420px] overflow-y-auto">
                  {calendarDates.map((d) => {
                    const calData = dashboard?.calendarData?.[d];
                    const style = getCalendarDayStyle(calData);
                    const isActive = selectedDate === d;
                    const isToday = d === dayjs().format("YYYY-MM-DD");
                    return (
                      <div key={d} className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSelectDate(d)}
                          className={`flex-1 flex items-center gap-2 px-2 py-2 rounded-xl transition-all ${
                            isActive
                              ? "ring-2 ring-[#3F72AF] ring-offset-1 dark:ring-offset-slate-900 bg-[#3F72AF]/5 dark:bg-[#3F72AF]/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${style.bg} ${style.text}`}
                          >
                            {dayjs(d).format("D")}
                          </div>
                          <div className="text-left min-w-0">
                            <p
                              className={`text-xs font-semibold truncate ${isActive ? "text-[#3F72AF]" : "text-slate-700 dark:text-slate-200"}`}
                            >
                              {dayjs(d).format("DD MMM")}
                              {isToday && (
                                <span className="ml-1 text-[9px] font-bold text-[#3F72AF] bg-[#3F72AF]/10 px-1 py-0.5 rounded-full">
                                  Today
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                              {calData?.isHoliday
                                ? `🎉 ${calData.holidayLabel}`
                                : dayjs(d).format("ddd")}
                            </p>
                          </div>
                          {calData?.attendanceMarked && !calData?.isHoliday && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-auto shrink-0">
                              {calData.presentPercent}%
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => openHolidayModal(d)}
                          className={`p-1.5 rounded-lg transition shrink-0 ${
                            calData?.isHoliday
                              ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500"
                              : "text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-400"
                          }`}
                          title={
                            calData?.isHoliday
                              ? `Holiday: ${calData.holidayLabel}`
                              : "Mark as holiday"
                          }
                        >
                          <Sun size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendance marking panel */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-[#3F72AF]" />
                      <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        Mark Attendance
                      </h3>
                    </div>
                    {selectedDate && (
                      <div className="flex items-center gap-2 mt-1 ml-5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {dayjs(selectedDate).format("dddd, DD MMMM YYYY")}
                        </p>
                        {dateHoliday && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${HOLIDAY_TYPE_CONFIG[dateHoliday.type]?.color || HOLIDAY_TYPE_CONFIG.other.color}`}
                          >
                            <Sun size={10} />
                            {dateHoliday.label}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ATTENDANCE_STATUSES.map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={s}
                          onClick={() => markAll(s)}
                          disabled={
                            loadingStudents ||
                            students.length === 0 ||
                            !!dateHoliday
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-40 ${cfg.idleBtn}`}
                        >
                          <Icon size={13} />
                          All {cfg.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={handleSave}
                      disabled={
                        saving ||
                        loadingStudents ||
                        !selectedDate ||
                        students.length === 0 ||
                        !!dateHoliday
                      }
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm ${
                        saveSuccess
                          ? "bg-emerald-600 text-white border border-emerald-600"
                          : "bg-[#3F72AF] hover:bg-[#2f5d95] text-white border border-[#3F72AF]"
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <CheckCircle2 size={13} />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save size={13} />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {dateHoliday && (
                  <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 flex items-center gap-3 text-sm text-rose-700 dark:text-rose-300">
                    <Sun size={15} className="shrink-0" />
                    <span>
                      <strong>{dateHoliday.label}</strong> — attendance cannot
                      be marked on holidays
                    </span>
                    <button
                      onClick={() => openHolidayModal(selectedDate)}
                      className="ml-auto text-xs underline opacity-70 hover:opacity-100"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {students.length > 0 && !dateHoliday && (
                  <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                      {
                        label: "Present",
                        value: markStats.present,
                        color:
                          "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
                      },
                      {
                        label: "Online",
                        value: markStats.online,
                        color:
                          "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
                      },
                      {
                        label: "Absent",
                        value: markStats.absent,
                        color:
                          "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
                      },
                      {
                        label: "Unmarked",
                        value: markStats.unmarked,
                        color:
                          "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className={`rounded-xl border p-3 text-center ${s.color}`}
                      >
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {loadingStudents || loadingAttendance ? (
                  <div className="flex items-center gap-2 py-10 justify-center text-sm text-slate-400">
                    <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
                    {loadingStudents
                      ? "Loading students..."
                      : "Loading attendance..."}
                  </div>
                ) : students.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users
                      size={36}
                      className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                    />
                    <p className="text-sm text-slate-400">
                      No students in this batch
                    </p>
                  </div>
                ) : !selectedDate ? (
                  <div className="py-12 text-center">
                    <Clock
                      size={32}
                      className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                    />
                    <p className="text-sm text-slate-400">
                      Select a date from the calendar
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/60">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Mark
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                        {students.map((s, idx) => {
                          const st = attendanceMap[s._id] || "";
                          const cfg = st ? STATUS_CONFIG[st] : null;
                          return (
                            <tr
                              key={s._id}
                              className={`transition-colors ${cfg?.rowBg || "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                            >
                              <td className="px-4 py-3.5 text-xs font-bold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-[#3F72AF]">
                                      {(s.name || "?")[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                      {s.name}
                                    </p>
                                    {s.phone && (
                                      <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {s.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 hidden md:table-cell text-sm text-slate-500 dark:text-slate-400">
                                {s.email || "—"}
                              </td>
                              <td className="px-4 py-3.5">
                                {cfg ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.pill}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                                    />
                                    {cfg.label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Not marked
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex justify-end gap-1.5">
                                  {ATTENDANCE_STATUSES.map((status) => {
                                    const c = STATUS_CONFIG[status];
                                    const Icon = c.icon;
                                    return (
                                      <button
                                        key={status}
                                        onClick={() =>
                                          setStudentStatus(s._id, status)
                                        }
                                        disabled={!!dateHoliday}
                                        title={c.label}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all disabled:opacity-40 ${st === status ? c.activeBtn : c.idleBtn}`}
                                      >
                                        <Icon size={12} />
                                        <span className="hidden sm:inline">
                                          {c.label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: REGISTER */}
          {activeTab === "register" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BookMarked size={16} className="text-[#3F72AF]" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Daily Register
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    — date-wise attendance summary
                  </span>
                </div>
                <button
                  onClick={() =>
                    selectedBatch && fetchDashboard(selectedBatch._id)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <RefreshCcw size={13} />
                  Refresh
                </button>
              </div>

              {loadingDashboard ? (
                <div className="flex items-center gap-2 py-10 justify-center text-sm text-slate-400">
                  <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
                  Loading register...
                </div>
              ) : !dashboard ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No data available
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                        {[
                          "Date",
                          "Day",
                          "Status",
                          "Present",
                          "Online",
                          "Absent",
                          "Unmarked",
                          "Attendance %",
                          "Actions",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 3 && i <= 6 ? "text-center" : "text-left"} ${
                              i === 3
                                ? "text-emerald-600 dark:text-emerald-400"
                                : i === 4
                                  ? "text-blue-600 dark:text-blue-400"
                                  : i === 5
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                      {[...dashboard.dailyRegister].reverse().map((row) => {
                        const isToday =
                          row.date === dayjs().format("YYYY-MM-DD");
                        return (
                          <tr
                            key={row.date}
                            className={`transition-colors ${
                              row.isHoliday
                                ? "bg-rose-50/60 dark:bg-rose-900/10"
                                : row.fullAttendance
                                  ? "bg-emerald-50/40 dark:bg-emerald-900/5"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-white">
                                  {dayjs(row.date).format("DD MMM YYYY")}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3F72AF] text-white">
                                    Today
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                              {dayjs(row.date).format("ddd")}
                            </td>
                            <td className="px-4 py-3.5">
                              {row.isHoliday ? (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${HOLIDAY_TYPE_CONFIG[row.holidayType]?.color || HOLIDAY_TYPE_CONFIG.other.color}`}
                                >
                                  <Sun size={10} />
                                  {row.holidayLabel}
                                </span>
                              ) : row.fullAttendance ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                                  <Award size={10} />
                                  Full House!
                                </span>
                              ) : row.attendanceMarked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                                  <CheckCircle2 size={10} />
                                  Marked
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600">
                                  <Clock size={10} />
                                  Pending
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {row.isHoliday ? "—" : row.present}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-blue-600 dark:text-blue-400">
                              {row.isHoliday ? "—" : row.online}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-red-600 dark:text-red-400">
                              {row.isHoliday ? "—" : row.absent}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                              {row.isHoliday ? "—" : row.unmarked}
                            </td>
                            <td className="px-4 py-3.5 min-w-[140px]">
                              {row.isHoliday ? (
                                <span className="text-xs text-slate-400">
                                  —
                                </span>
                              ) : row.attendanceMarked ? (
                                <PctBar
                                  pct={row.presentPercent}
                                  atRisk={row.presentPercent < 50}
                                />
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Not marked
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-end gap-1.5">
                                {!row.isHoliday && (
                                  <button
                                    onClick={() => {
                                      handleTabChange("mark");
                                      handleSelectDate(row.date);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                  >
                                    <CalendarCheck2 size={11} />
                                    {row.attendanceMarked ? "Edit" : "Mark"}
                                  </button>
                                )}
                                <button
                                  onClick={() => openHolidayModal(row.date)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                    row.isHoliday
                                      ? "border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 hover:bg-rose-100"
                                      : "border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <Sun size={11} />
                                  {row.isHoliday ? "Edit" : "Holiday"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === "students" && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#3F72AF]" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Student Analytics
                  </h3>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    — sorted by attendance %
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {dashboard?.summary.atRiskStudents > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-700 dark:text-red-300">
                      <TrendingDown size={13} />
                      {dashboard.summary.atRiskStudents} at-risk (below{" "}
                      {THRESHOLD}%)
                    </div>
                  )}
                  <button
                    onClick={() =>
                      selectedBatch && fetchDashboard(selectedBatch._id)
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <RefreshCcw size={13} />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingDashboard ? (
                <div className="flex items-center gap-2 py-10 justify-center text-sm text-slate-400">
                  <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
                  Calculating stats...
                </div>
              ) : !dashboard ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No data available
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Online
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Unmarked
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[200px]">
                          Attendance %
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                      {[...dashboard.studentStats]
                        .sort((a, b) => a.attendancePct - b.attendancePct)
                        .map((s, idx) => (
                          <tr
                            key={s._id}
                            className={`transition-colors ${
                              s.isAtRisk
                                ? "bg-red-50/40 dark:bg-red-900/5"
                                : s.attendancePct === 100
                                  ? "bg-emerald-50/30 dark:bg-emerald-900/5"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            }`}
                          >
                            <td className="px-4 py-3.5 text-xs font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    s.isAtRisk
                                      ? "bg-red-100 dark:bg-red-900/30"
                                      : "bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20"
                                  }`}
                                >
                                  <span
                                    className={`text-xs font-bold ${s.isAtRisk ? "text-red-600 dark:text-red-400" : "text-[#3F72AF]"}`}
                                  >
                                    {(s.name || "?")[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-white text-sm">
                                    {s.name}
                                  </p>
                                  <p className="text-xs text-slate-400 dark:text-slate-500">
                                    {s.email || "—"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {s.present}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-blue-600 dark:text-blue-400">
                              {s.online}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-red-600 dark:text-red-400">
                              {s.absent}
                            </td>
                            <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                              {s.unmarked}
                            </td>
                            <td className="px-4 py-3.5 min-w-[200px]">
                              <PctBar
                                pct={s.attendancePct}
                                atRisk={s.isAtRisk}
                              />
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                {s.totalPresent} of {s.totalWorkingDays} working
                                days
                                {s.effectivePct !== null &&
                                  s.markedDays > 0 &&
                                  ` · ${s.effectivePct}% of marked days`}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              {s.isAtRisk ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700">
                                  <AlertTriangle size={10} />
                                  At Risk
                                </span>
                              ) : s.attendancePct === 100 ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                                  <Award size={10} />
                                  Perfect
                                </span>
                              ) : s.markedDays === 0 ? (
                                <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                  No data
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  Good
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <AddHolidayModal
        open={holidayModal.open}
        batchId={selectedBatch?._id}
        date={holidayModal.date}
        existingHoliday={holidayModal.existing}
        onClose={() =>
          setHolidayModal({ open: false, date: "", existing: null })
        }
        onSuccess={handleHolidaySuccess}
      />
    </div>
  );
};

export default AdminAttendance;
