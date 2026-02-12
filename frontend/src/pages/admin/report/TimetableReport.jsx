import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import BatchReportFilters from "./components/BatchReportFilters";
import { Filter, Search, RefreshCcw } from "lucide-react";

const TimetableReport = () => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");

  const [slots, setSlots] = useState([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState("");

  // Extra filters
  const [filters, setFilters] = useState({
    search: "",
    day: "",
    tutorId: "",
    room: "",
    startMin: "",
    endMin: "",
    sortBy: "day",
    sortOrder: "asc",
  });

  // =========================
  // Helpers
  // =========================
  const safeArr = (x) => (Array.isArray(x) ? x : []);

  const minutesToTime = (m) => {
    if (m === null || m === undefined || m === "") return "-";
    const mins = Number(m);
    if (Number.isNaN(mins)) return "-";

    const h24 = Math.floor(mins / 60);
    const mm = mins % 60;

    const ampm = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;

    return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
  };

  const normalizeDay = (d) => (d || "").toString().trim().toLowerCase();

  const dayOrder = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };

  // =========================
  // Load courses
  // =========================
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await axiosInstance.get("/courses/all");

        console.log("COURSES API:", res.data);

        const arr = res.data?.courses || res.data || [];
        setCourses(safeArr(arr));
      } catch (err) {
        console.error(err);
        setError("Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  // =========================
  // Load batches by course
  // =========================
  useEffect(() => {
    const loadBatches = async () => {
      if (!selectedCourse) {
        setBatches([]);
        setSelectedBatch("");
        return;
      }

      try {
        setLoadingBatches(true);
        setError("");

        const res = await axiosInstance.get(
          `/batches/by-course/${selectedCourse}`,
        );

        console.log("BATCHES BY COURSE API:", res.data);

        const arr = res.data?.batches || res.data || [];
        setBatches(safeArr(arr));
      } catch (err) {
        console.error(err);
        setError("Failed to load batches.");
        setBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    loadBatches();
  }, [selectedCourse]);

  // =========================
  // Load timetable slots
  // =========================
  const fetchSlots = async () => {
    if (!selectedBatch) {
      setSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const res = await axiosInstance.get(`/timetable/batch/${selectedBatch}`);

      console.log("TIMETABLE API:", res.data);

      const arr = res.data?.slots || res.data || [];
      setSlots(safeArr(arr));
    } catch (err) {
      console.error(err);
      setError("Failed to load timetable.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedBatch]);

  // =========================
  // Tutors list (from slots)
  // =========================
  const tutors = useMemo(() => {
    const map = new Map();

    for (const s of safeArr(slots)) {
      const t = s?.tutor;
      const id = t?._id;
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, { _id: id, name: t?.name || "Tutor" });
      }
    }

    return Array.from(map.values());
  }, [slots]);

  // Rooms list (from slots)
  const rooms = useMemo(() => {
    const set = new Set();
    for (const s of safeArr(slots)) {
      if (s?.room) set.add(s.room);
    }
    return Array.from(set);
  }, [slots]);

  // =========================
  // Filtering + Sorting
  // =========================
  const filteredSlots = useMemo(() => {
    let list = safeArr(slots);

    // Search (tutor name / room / course / day)
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const day = (s?.day || "").toLowerCase();
        const room = (s?.room || "").toLowerCase();
        const tutor = (s?.tutor?.name || "").toLowerCase();
        const course = (s?.course?.title || "").toLowerCase();
        return (
          day.includes(q) ||
          room.includes(q) ||
          tutor.includes(q) ||
          course.includes(q)
        );
      });
    }

    // Day filter
    if (filters.day) {
      list = list.filter(
        (s) => normalizeDay(s?.day) === normalizeDay(filters.day),
      );
    }

    // Tutor filter
    if (filters.tutorId) {
      list = list.filter((s) => s?.tutor?._id === filters.tutorId);
    }

    // Room filter
    if (filters.room) {
      list = list.filter((s) => (s?.room || "") === filters.room);
    }

    // Start/end minute filter
    const startMin = filters.startMin === "" ? null : Number(filters.startMin);
    const endMin = filters.endMin === "" ? null : Number(filters.endMin);

    if (startMin !== null && !Number.isNaN(startMin)) {
      list = list.filter((s) => Number(s?.startMinutes ?? -1) >= startMin);
    }

    if (endMin !== null && !Number.isNaN(endMin)) {
      list = list.filter((s) => Number(s?.endMinutes ?? 99999) <= endMin);
    }

    // Sorting
    const order = filters.sortOrder === "asc" ? 1 : -1;

    list = [...list].sort((a, b) => {
      if (filters.sortBy === "day") {
        const ad = dayOrder[normalizeDay(a?.day)] || 99;
        const bd = dayOrder[normalizeDay(b?.day)] || 99;
        return (ad - bd) * order;
      }

      if (filters.sortBy === "startMinutes") {
        return ((a?.startMinutes ?? 0) - (b?.startMinutes ?? 0)) * order;
      }

      if (filters.sortBy === "tutor") {
        return (
          (a?.tutor?.name || "").localeCompare(b?.tutor?.name || "") * order
        );
      }

      if (filters.sortBy === "room") {
        return (a?.room || "").localeCompare(b?.room || "") * order;
      }

      return 0;
    });

    return list;
  }, [slots, filters]);

  // =========================
  // Export (filtered)
  // =========================
  const exportRows = useMemo(() => {
    return safeArr(filteredSlots).map((s) => ({
      Day: s?.day || "",
      StartTime: minutesToTime(s?.startMinutes),
      EndTime: minutesToTime(s?.endMinutes),
      StartMinutes: s?.startMinutes ?? "",
      EndMinutes: s?.endMinutes ?? "",
      Room: s?.room || "",
      Tutor: s?.tutor?.name || "",
      Course: s?.course?.title || "",
    }));
  }, [filteredSlots]);

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div
        className="
          rounded-3xl p-6
          border border-slate-200 dark:border-slate-700
          bg-gradient-to-br from-white via-slate-50 to-slate-100
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-800
          shadow-sm
        "
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Timetable Report
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Select course → batch → filter timetable slots → export CSV.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSlots}
              disabled={!selectedBatch}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-sm font-semibold text-slate-700 dark:text-slate-200
                shadow-sm transition-all duration-300
                hover:shadow-lg hover:-translate-y-[1px]
                active:translate-y-0
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:translate-y-0
              "
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <ExportCSVButton
              rows={exportRows}
              filename="timetable-report.csv"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* COURSE + BATCH */}
      <div
        className="
          rounded-3xl border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          shadow-sm hover:shadow-lg transition-all duration-300
          p-4
        "
      >
        <BatchReportFilters
          courses={courses}
          batches={batches}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          loadingBatches={loadingBatches}
        />
      </div>

      {/* FILTERS */}
      <div
        className="
          rounded-3xl border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          shadow-sm hover:shadow-lg transition-all duration-300
          overflow-hidden
        "
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <Filter
                size={18}
                className="text-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                Filters & Sorting
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Filter by day, tutor, room, time range and sort
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredSlots?.length || 0} slots
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              placeholder="Search day / room / tutor / course..."
              className="
                w-full pl-10 pr-3 py-2.5 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800
                text-sm text-slate-800 dark:text-slate-100
                shadow-sm transition-all duration-300
                hover:shadow-md
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              "
            />
          </div>

          {/* Day */}
          <select
            value={filters.day}
            onChange={(e) => setFilters((p) => ({ ...p, day: e.target.value }))}
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          >
            <option value="">All Days</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>

          {/* Tutor */}
          <select
            value={filters.tutorId}
            onChange={(e) =>
              setFilters((p) => ({ ...p, tutorId: e.target.value }))
            }
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          >
            <option value="">All Tutors</option>
            {(tutors || []).map((t) => (
              <option key={t?._id} value={t?._id}>
                {t?.name || "Tutor"}
              </option>
            ))}
          </select>

          {/* Room */}
          <select
            value={filters.room}
            onChange={(e) =>
              setFilters((p) => ({ ...p, room: e.target.value }))
            }
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          >
            <option value="">All Rooms</option>
            {(rooms || []).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* StartMin */}
          <input
            value={filters.startMin}
            onChange={(e) =>
              setFilters((p) => ({ ...p, startMin: e.target.value }))
            }
            placeholder="Start min (e.g. 540)"
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          />

          {/* EndMin */}
          <input
            value={filters.endMin}
            onChange={(e) =>
              setFilters((p) => ({ ...p, endMin: e.target.value }))
            }
            placeholder="End min (e.g. 1020)"
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          />

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((p) => ({ ...p, sortBy: e.target.value }))
            }
            className="
              md:col-span-2
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          >
            <option value="day">Sort: Day</option>
            <option value="startMinutes">Sort: Start Time</option>
            <option value="tutor">Sort: Tutor</option>
            <option value="room">Sort: Room</option>
          </select>

          {/* Sort Order */}
          <select
            value={filters.sortOrder}
            onChange={(e) =>
              setFilters((p) => ({ ...p, sortOrder: e.target.value }))
            }
            className="
              md:col-span-2
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
            "
          >
            <option value="asc">Order: Ascending</option>
            <option value="desc">Order: Descending</option>
          </select>

          {/* Reset */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  day: "",
                  tutorId: "",
                  room: "",
                  startMin: "",
                  endMin: "",
                  sortBy: "day",
                  sortOrder: "asc",
                })
              }
              className="
                px-4 py-2.5 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-sm font-semibold text-slate-700 dark:text-slate-200
                shadow-sm transition-all duration-300
                hover:shadow-lg hover:-translate-y-[1px]
                active:translate-y-0
              "
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="
          rounded-3xl border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-900
          overflow-hidden shadow-sm hover:shadow-lg
          transition-all duration-300
        "
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Timetable Slots
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredSlots?.length || 0}
          </span>
        </div>

        {loadingCourses || loadingSlots ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-300">
            Loading timetable...
          </div>
        ) : !selectedBatch ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Select a batch to view timetable
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Choose course → batch first.
            </p>
          </div>
        ) : (filteredSlots || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No timetable slots found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Try removing some filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Day
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Start
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    End
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Room
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Tutor
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Course
                  </th>
                </tr>
              </thead>

              <tbody>
                {(filteredSlots || []).map((s) => (
                  <tr
                    key={s?._id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100 capitalize">
                      {s?.day || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {minutesToTime(s?.startMinutes)}
                      <span className="text-xs text-slate-400 ml-2">
                        ({s?.startMinutes ?? "-"})
                      </span>
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {minutesToTime(s?.endMinutes)}
                      <span className="text-xs text-slate-400 ml-2">
                        ({s?.endMinutes ?? "-"})
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {s?.room || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200 font-medium">
                      {s?.tutor?.name || "-"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {s?.course?.title || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetableReport;
