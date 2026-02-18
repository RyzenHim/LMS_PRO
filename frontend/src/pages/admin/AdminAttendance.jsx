import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axios";
import {
  CalendarCheck2,
  Users,
  CheckCircle2,
  XCircle,
  BookOpen,
  GraduationCap,
  RefreshCcw,
} from "lucide-react";

const AdminAttendance = () => {
  // =========================
  // State
  // =========================
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [attendanceMap, setAttendanceMap] = useState({});

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================
  // Helpers
  // =========================
  const toISODate = (dateInput) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDatesBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];

    const dates = [];
    const cur = new Date(startDate);

    while (cur <= endDate) {
      dates.push(toISODate(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return dates;
  };

  // =========================
  // Calendar dates
  // =========================
  const calendarDates = useMemo(() => {
    if (!selectedBatch?.startDate) return [];

    // if no endDate, show only startDate
    if (!selectedBatch?.endDate) {
      const d = toISODate(selectedBatch.startDate);
      return d ? [d] : [];
    }

    return getDatesBetween(selectedBatch.startDate, selectedBatch.endDate);
  }, [selectedBatch]);

  // =========================
  // Fetch Courses
  // =========================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setError("");

        const res = await axiosInstance.get("/courses/all");
        const list = res.data?.courses || res.data || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load courses");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // =========================
  // Fetch Batches by Course
  // =========================
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

        // ✅ FIXED ENDPOINT
        const res = await axiosInstance.get(
          `/batch/by-course/${selectedCourse}`,
        );

        const list = res.data?.batches || [];
        setBatches(Array.isArray(list) ? list : []);

        // reset batch selection
        setSelectedBatch(null);
        setSelectedDate("");
        setStudents([]);
        setAttendanceMap({});
      } catch (err) {
        console.error(err);
        setError("Failed to load batches for selected course");
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, [selectedCourse]);

  // =========================
  // Fetch Students for Batch
  // =========================
  const fetchBatchStudents = async (batchId) => {
    try {
      setLoadingStudents(true);
      setError("");

      // ⚠️ Make sure this route exists in backend
      const res = await axiosInstance.get(`/batch/${batchId}/students`);

      const list = res.data?.students || [];
      setStudents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load students for batch");
    } finally {
      setLoadingStudents(false);
    }
  };

  // =========================
  // Fetch Attendance for date
  // =========================
  const fetchAttendance = async ({ batchId, date }) => {
    try {
      setLoadingAttendance(true);
      setError("");

      const res = await axiosInstance.get(`/attendance/batch/${batchId}`, {
        params: { date },
      });

      const records = res.data?.records || [];
      const map = {};

      records.forEach((r) => {
        const studentId =
          typeof r.student === "object" ? r.student?._id : r.student;
        if (studentId) map[studentId] = r.status;
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error(err);

      // if not marked yet, treat as empty
      if (err?.response?.status === 404) {
        setAttendanceMap({});
        return;
      }

      setError("Failed to load attendance for selected date");
    } finally {
      setLoadingAttendance(false);
    }
  };

  // =========================
  // Select Batch
  // =========================
  const handleSelectBatch = async (batch) => {
    setSelectedBatch(batch);
    setSelectedDate("");
    setAttendanceMap({});
    setStudents([]);

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

  // =========================
  // Select Date
  // =========================
  const handleSelectDate = async (date) => {
    if (!selectedBatch?._id) return;
    if (!date) return;

    setSelectedDate(date);
    await fetchAttendance({ batchId: selectedBatch._id, date });
  };

  // =========================
  // Mark Attendance
  // =========================
  const setStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAll = (status) => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = status;
    });
    setAttendanceMap(map);
  };

  // =========================
  // Save Attendance
  // =========================
  const handleSave = async () => {
    if (!selectedBatch?._id) return;
    if (!selectedDate) return;

    try {
      setSaving(true);
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

      alert("Attendance saved successfully ✅");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // UI Helpers
  // =========================
  const statusPill = (status) => {
    const s = String(status || "").toLowerCase();

    const map = {
      ongoing:
        "bg-emerald-500/10 text-emerald-700 border-emerald-300/40 dark:text-emerald-200",
      upcoming:
        "bg-blue-500/10 text-blue-700 border-blue-300/40 dark:text-blue-200",
      completed:
        "bg-slate-500/10 text-slate-700 border-slate-300/40 dark:text-slate-200",
    };

    return map[s] || "bg-slate-500/10 text-slate-700 border-slate-300/40";
  };

  if (loadingCourses) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading attendance module...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">
              Attendance
            </h1>
            <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
              Select a course → choose batch → mark attendance date-wise.
            </p>
          </div>

          <div className="w-full lg:w-[360px]">
            <label className="text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Select Course
            </label>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-2 w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-2xl px-4 py-3 bg-white/80 dark:bg-slate-800/70 dark:text-[#DBE2EF] outline-none"
            >
              <option value="">Choose course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* BATCHES */}
      <div className="rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
          <BookOpen size={18} className="text-[#3F72AF]" />
          Batches
        </div>

        {!selectedCourse ? (
          <div className="text-sm text-[#3F72AF] dark:text-slate-300">
            Select a course to view its batches.
          </div>
        ) : loadingBatches ? (
          <div className="text-sm text-[#3F72AF] dark:text-slate-300">
            Loading batches...
          </div>
        ) : batches.length === 0 ? (
          <div className="text-sm text-[#3F72AF] dark:text-slate-300">
            No batches found for this course.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {batches.map((b) => {
              const active = selectedBatch?._id === b._id;

              return (
                <button
                  key={b._id}
                  onClick={() => handleSelectBatch(b)}
                  className={`text-left rounded-3xl border p-5 transition ${
                    active
                      ? "border-[#3F72AF] bg-[#DBE2EF]/60 dark:bg-[#3F72AF]/20 shadow-md"
                      : "border-white/60 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-[#112D4E] dark:text-[#DBE2EF]">
                        {b.name}
                      </p>

                      <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-1">
                        Start:{" "}
                        {b.startDate
                          ? new Date(b.startDate).toLocaleDateString()
                          : "—"}{" "}
                        • End:{" "}
                        {b.endDate
                          ? new Date(b.endDate).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <div className="p-2 rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-white/60 dark:border-slate-700">
                      <GraduationCap
                        size={18}
                        className="text-[#3F72AF] dark:text-[#DBE2EF]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusPill(
                        b.status,
                      )}`}
                    >
                      {b.status || "upcoming"}
                    </span>

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                        b.isActive
                          ? "bg-emerald-500/10 text-emerald-700 border-emerald-300/40"
                          : "bg-red-500/10 text-red-700 border-red-300/40"
                      }`}
                    >
                      {b.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ATTENDANCE PANEL */}
      {selectedBatch && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* CALENDAR */}
          <div className="xl:col-span-1 rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                <CalendarCheck2 size={18} className="text-[#3F72AF]" />
                Calendar
              </div>

              <button
                onClick={() => {
                  if (selectedBatch?._id && selectedDate) {
                    fetchAttendance({
                      batchId: selectedBatch._id,
                      date: selectedDate,
                    });
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-[#DBE2EF] dark:border-slate-700 text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
              >
                <RefreshCcw size={14} />
                Refresh
              </button>
            </div>

            <div className="text-xs text-[#3F72AF] dark:text-slate-300 mb-4">
              Dates from batch start → end
            </div>

            {calendarDates.length === 0 ? (
              <div className="text-sm text-[#3F72AF] dark:text-slate-300">
                Batch has no valid dates.
              </div>
            ) : (
              <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                {calendarDates.map((d) => {
                  const active = selectedDate === d;

                  return (
                    <button
                      key={d}
                      onClick={() => handleSelectDate(d)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                        active
                          ? "border-[#3F72AF] bg-[#DBE2EF]/60 dark:bg-[#3F72AF]/20"
                          : "border-white/60 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 hover:bg-white/80 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                        {new Date(d).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-0.5">
                        {d}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* STUDENTS */}
          <div className="xl:col-span-2 rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                <Users size={18} className="text-[#3F72AF]" />
                Students Attendance
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => markAll("present")}
                  disabled={loadingStudents || loadingAttendance}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Mark All Present
                </button>

                <button
                  onClick={() => markAll("absent")}
                  disabled={loadingStudents || loadingAttendance}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition disabled:opacity-60"
                >
                  <XCircle size={14} />
                  Mark All Absent
                </button>

                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    loadingStudents ||
                    loadingAttendance ||
                    !selectedDate
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-xs font-semibold shadow-lg shadow-[#3F72AF]/20 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>

            {/* INFO */}
            <div className="rounded-2xl border border-white/50 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Batch: {selectedBatch.name}
              </p>
              <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-1">
                Date:{" "}
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString()
                  : "Select a date"}
              </p>
            </div>

            {/* CONTENT */}
            {loadingStudents ? (
              <div className="text-sm text-[#3F72AF] dark:text-slate-300">
                Loading students...
              </div>
            ) : loadingAttendance ? (
              <div className="text-sm text-[#3F72AF] dark:text-slate-300">
                Loading attendance...
              </div>
            ) : students.length === 0 ? (
              <div className="text-sm text-[#3F72AF] dark:text-slate-300">
                No students found in this batch.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-white/50 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-[#DBE2EF]/80 dark:bg-slate-800/80 border-b border-white/40 dark:border-slate-700">
                    <tr>
                      <th className="p-4 text-left">Student</th>
                      <th className="p-4 text-left">Email</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-right">Mark</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#DBE2EF]/60 dark:divide-slate-700">
                    {students.map((s) => {
                      const status = attendanceMap[s._id] || "";

                      return (
                        <tr
                          key={s._id}
                          className="hover:bg-[#DBE2EF]/40 dark:hover:bg-slate-800/40 transition"
                        >
                          <td className="p-4 font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                            {s.name}
                          </td>

                          <td className="p-4 text-[#3F72AF] dark:text-slate-300">
                            {s.email || "—"}
                          </td>

                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                                status === "present"
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-300/40"
                                  : status === "absent"
                                    ? "bg-red-500/10 text-red-700 border-red-300/40"
                                    : "bg-slate-500/10 text-slate-700 border-slate-300/40"
                              }`}
                            >
                              {status || "not marked"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setStatus(s._id, "present")}
                                className={`px-3 py-2 rounded-2xl border text-xs font-semibold transition ${
                                  status === "present"
                                    ? "bg-emerald-600 text-white border-emerald-600"
                                    : "bg-white/70 dark:bg-slate-800/50 border-white/60 dark:border-slate-700 text-[#112D4E] dark:text-[#DBE2EF] hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                }`}
                              >
                                Present
                              </button>

                              <button
                                onClick={() => setStatus(s._id, "absent")}
                                className={`px-3 py-2 rounded-2xl border text-xs font-semibold transition ${
                                  status === "absent"
                                    ? "bg-red-600 text-white border-red-600"
                                    : "bg-white/70 dark:bg-slate-800/50 border-white/60 dark:border-slate-700 text-[#112D4E] dark:text-[#DBE2EF] hover:bg-red-50 dark:hover:bg-red-500/10"
                                }`}
                              >
                                Absent
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
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
