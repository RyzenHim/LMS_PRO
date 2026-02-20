import React, { useEffect, useMemo, useState, useCallback } from "react";
import axiosInstance from "../../api/axios";
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
} from "lucide-react";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

// ─── Status config — enum: present | absent | present-online ───
const STATUS_CONFIG = {
  present: {
    label: "Present",
    icon: CheckCircle2,
    // button active
    activeBtn:
      "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200 dark:shadow-none",
    // button idle
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300",
    // status pill
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
  "present-online": {
    label: "Online",
    icon: Wifi,
    activeBtn:
      "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 dark:shadow-none",
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300",
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
  },
  absent: {
    label: "Absent",
    icon: XCircle,
    activeBtn:
      "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200 dark:shadow-none",
    idleBtn:
      "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-300",
    pill: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    dot: "bg-red-500",
  },
};

// ─── Batch status pill — enum: upcoming | running | completed ───
const batchStatusPill = (status) => {
  const s = String(status || "upcoming").toLowerCase();
  const map = {
    upcoming:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    running:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    completed:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600",
  };
  return map[s] || map.upcoming;
};

const toISODate = (d) => {
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

const formatUI = (d) => {
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format("DD MMM YYYY") : "—";
};

const formatDay = (d) => {
  const parsed = dayjs(d);
  return parsed.isValid() ? parsed.format("ddd") : "";
};

const getDatesBetween = (start, end) => {
  const s = dayjs(start);
  const e = dayjs(end);
  if (!s.isValid() || !e.isValid()) return [];
  const dates = [];
  let cur = s;
  while (cur.isSameOrBefore(e, "day")) {
    dates.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, "day");
  }
  return dates;
};

// ─── Stat card ───
const StatCard = ({ label, value, color }) => (
  <div className={`rounded-2xl border p-4 ${color}`}>
    <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
      {label}
    </p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const AdminAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // attendanceMap: { studentId: "present" | "absent" | "present-online" }
  const [attendanceMap, setAttendanceMap] = useState({});

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [error, setError] = useState("");

  const calendarDates = useMemo(() => {
    if (!selectedBatch?.startDate) return [];
    if (!selectedBatch?.endDate) {
      const d = toISODate(selectedBatch.startDate);
      return d ? [d] : [];
    }
    return getDatesBetween(selectedBatch.startDate, selectedBatch.endDate);
  }, [selectedBatch]);

  // Attendance stats
  const stats = useMemo(() => {
    const total = students.length;
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
    return { total, present, online, absent, unmarked };
  }, [students, attendanceMap]);

  // ─── Fetch courses ───
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await axiosInstance.get("/courses/all");
        const list = res.data?.courses || res.data || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // ─── Fetch batches by course ───
  useEffect(() => {
    if (!selectedCourse) {
      setBatches([]);
      setSelectedBatch(null);
      setSelectedDate("");
      setStudents([]);
      setAttendanceMap({});
      return;
    }
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        setError("");
        const res = await axiosInstance.get(
          `/batch/by-course/${selectedCourse}`,
        );
        const list = res.data?.batches || [];
        setBatches(Array.isArray(list) ? list : []);
        setSelectedBatch(null);
        setSelectedDate("");
        setStudents([]);
        setAttendanceMap({});
      } catch (err) {
        setError("Failed to load batches for selected course");
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [selectedCourse]);

  // ─── Fetch students ───
  const fetchBatchStudents = useCallback(async (batchId) => {
    try {
      setLoadingStudents(true);
      setError("");
      const res = await axiosInstance.get(
        `/attendance/batch/${batchId}/students`,
      );
      const list = res.data?.students || [];
      setStudents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError("Failed to load students for batch");
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // ─── Fetch attendance ───
  const fetchAttendance = useCallback(async ({ batchId, date }) => {
    try {
      setLoadingAttendance(true);
      setError("");
      const res = await axiosInstance.get(`/attendance/batch/${batchId}`, {
        params: { date },
      });
      const records = res.data?.records || [];
      const map = {};
      records.forEach((r) => {
        const sid = typeof r.student === "object" ? r.student?._id : r.student;
        if (sid) map[sid] = r.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      if (err?.response?.status === 404) {
        setAttendanceMap({});
        return;
      }
      setError("Failed to load attendance for selected date");
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // ─── Select batch ───
  const handleSelectBatch = async (batch) => {
    setSelectedBatch(batch);
    setSelectedDate("");
    setAttendanceMap({});
    setStudents([]);
    setSaveSuccess(false);

    await fetchBatchStudents(batch._id);

    const dates =
      batch?.startDate && batch?.endDate
        ? getDatesBetween(batch.startDate, batch.endDate)
        : batch?.startDate
          ? [toISODate(batch.startDate)]
          : [];

    const firstDate = dates[0];
    if (firstDate) {
      setSelectedDate(firstDate);
      await fetchAttendance({ batchId: batch._id, date: firstDate });
    }
  };

  // ─── Select date ───
  const handleSelectDate = async (date) => {
    if (!selectedBatch?._id || !date) return;
    setSelectedDate(date);
    setSaveSuccess(false);
    await fetchAttendance({ batchId: selectedBatch._id, date });
  };

  // ─── Set single student status ───
  const setStudentStatus = useCallback((studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  }, []);

  // ─── Mark all ───
  const markAll = useCallback(
    (status) => {
      const map = {};
      students.forEach((s) => {
        map[s._id] = status;
      });
      setAttendanceMap(map);
    },
    [students],
  );

  // ─── Save ───
  const handleSave = async () => {
    if (!selectedBatch?._id || !selectedDate) return;
    try {
      setSaving(true);
      setSaveSuccess(false);
      setError("");
      const payload = {
        date: selectedDate,
        records: students.map((s) => ({
          student: s._id,
          status: attendanceMap[s._id] || "absent",
        })),
      };
      await axiosInstance.post(
        `/attendance/batch/${selectedBatch._id}/mark`,
        payload,
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  if (loadingCourses) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="w-5 h-5 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">
            Loading attendance module...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* ── HEADER ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20">
                <CalendarCheck2 size={20} className="text-[#3F72AF]" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Attendance
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
              Select course → batch → date → mark attendance
            </p>
          </div>

          <div className="lg:w-80">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition"
            >
              <option value="">Select a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── BATCHES ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen size={17} className="text-[#3F72AF]" />
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Batches
          </h2>
        </div>

        {!selectedCourse ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
            Select a course above to view its batches
          </p>
        ) : loadingBatches ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
            No batches found for this course
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {batches.map((b) => {
              const active = selectedBatch?._id === b._id;
              return (
                <button
                  key={b._id}
                  onClick={() => handleSelectBatch(b)}
                  className={`text-left rounded-2xl border p-4 transition-all ${
                    active
                      ? "border-[#3F72AF] bg-[#3F72AF]/5 dark:bg-[#3F72AF]/10 shadow-sm ring-1 ring-[#3F72AF]/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {b.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatUI(b.startDate)} →{" "}
                        {b.endDate ? formatUI(b.endDate) : "ongoing"}
                      </p>
                    </div>
                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition ${active ? "bg-[#3F72AF]/10" : "bg-white dark:bg-slate-700"}`}
                    >
                      <GraduationCap
                        size={16}
                        className={
                          active
                            ? "text-[#3F72AF]"
                            : "text-slate-400 dark:text-slate-500"
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* batch status — enum: upcoming | running | completed */}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${batchStatusPill(b.status)}`}
                    >
                      {b.status || "upcoming"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        b.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600"
                      }`}
                    >
                      {b.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  {active && (
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#3F72AF]">
                      <ChevronRight size={12} />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ATTENDANCE PANEL ── */}
      {selectedBatch && (
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
          {/* ── CALENDAR SIDEBAR ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={16} className="text-[#3F72AF]" />
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Calendar
                </h3>
              </div>
              <button
                onClick={() =>
                  selectedBatch?._id &&
                  selectedDate &&
                  fetchAttendance({
                    batchId: selectedBatch._id,
                    date: selectedDate,
                  })
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Refresh"
              >
                <RefreshCcw size={14} />
              </button>
            </div>

            {calendarDates.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Batch has no valid dates.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {calendarDates.map((d) => {
                  const active = selectedDate === d;
                  const isToday = d === dayjs().format("YYYY-MM-DD");
                  return (
                    <button
                      key={d}
                      onClick={() => handleSelectDate(d)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                        active
                          ? "border-[#3F72AF] bg-[#3F72AF]/8 dark:bg-[#3F72AF]/15 ring-1 ring-[#3F72AF]/20"
                          : "border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-semibold ${active ? "text-[#3F72AF]" : "text-slate-700 dark:text-slate-200"}`}
                          >
                            {formatUI(d)}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${active ? "text-[#3F72AF]/70" : "text-slate-400 dark:text-slate-500"}`}
                          >
                            {formatDay(d)}
                          </p>
                        </div>
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3F72AF] text-white">
                            Today
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── STUDENTS TABLE ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#3F72AF]" />
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Student Attendance
                  </h3>
                </div>
                {selectedDate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                    {selectedBatch.name} · {formatUI(selectedDate)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Mark all buttons */}
                {["present", "present-online", "absent"].map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => markAll(s)}
                      disabled={
                        loadingStudents ||
                        loadingAttendance ||
                        students.length === 0
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition disabled:opacity-50 ${cfg.idleBtn}`}
                    >
                      <Icon size={13} />
                      All {cfg.label}
                    </button>
                  );
                })}

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    loadingStudents ||
                    loadingAttendance ||
                    !selectedDate ||
                    students.length === 0
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
                      Save Attendance
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats row */}
            {students.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <StatCard
                  label="Present"
                  value={stats.present}
                  color="border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                />
                <StatCard
                  label="Online"
                  value={stats.online}
                  color="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                />
                <StatCard
                  label="Absent"
                  value={stats.absent}
                  color="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                />
                <StatCard
                  label="Unmarked"
                  value={stats.unmarked}
                  color="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                />
              </div>
            )}

            {/* Loading states */}
            {loadingStudents || loadingAttendance ? (
              <div className="flex items-center gap-2 py-8 justify-center text-sm text-slate-400 dark:text-slate-500">
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
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No students in this batch
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Add students to this batch first
                </p>
              </div>
            ) : !selectedDate ? (
              <div className="py-12 text-center">
                <Clock
                  size={36}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Select a date from the calendar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/60">
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
                      const currentStatus = attendanceMap[s._id] || "";
                      const cfg = currentStatus
                        ? STATUS_CONFIG[currentStatus]
                        : null;

                      return (
                        <tr
                          key={s._id}
                          className={`transition-colors ${
                            currentStatus === "present"
                              ? "bg-emerald-50/40 dark:bg-emerald-900/5"
                              : currentStatus === "present-online"
                                ? "bg-blue-50/40 dark:bg-blue-900/5"
                                : currentStatus === "absent"
                                  ? "bg-red-50/30 dark:bg-red-900/5"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                              {idx + 1}
                            </span>
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

                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                              {s.email || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {currentStatus && cfg ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.pill}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                                />
                                {cfg.label}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                Not marked
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {/* 3 status buttons — present | present-online | absent */}
                            <div className="flex justify-end gap-1.5">
                              {["present", "present-online", "absent"].map(
                                (st) => {
                                  const c = STATUS_CONFIG[st];
                                  const Icon = c.icon;
                                  const isActive = currentStatus === st;
                                  return (
                                    <button
                                      key={st}
                                      onClick={() =>
                                        setStudentStatus(s._id, st)
                                      }
                                      title={c.label}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                        isActive ? c.activeBtn : c.idleBtn
                                      }`}
                                    >
                                      <Icon size={12} />
                                      <span className="hidden sm:inline">
                                        {c.label}
                                      </span>
                                    </button>
                                  );
                                },
                              )}
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
    </div>
  );
};

export default AdminAttendance;
