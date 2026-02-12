import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import { Search, RefreshCcw, Filter } from "lucide-react";

const StudentReport = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    course: "",
    batch: "",
    status: "",
    search: "",
  });

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoadingDropdowns(true);

        const [cRes, bRes] = await Promise.all([
          axiosInstance.get("/courses/all"),
          axiosInstance.get("/batches/all"),
        ]);

        console.log("COURSES API:", cRes.data);
        console.log("BATCHES API:", bRes.data);

        const courseArr = cRes.data?.courses || cRes.data || [];
        const batchArr = bRes.data?.batches || bRes.data || [];

        setCourses(Array.isArray(courseArr) ? courseArr : []);
        setBatches(Array.isArray(batchArr) ? batchArr : []);
      } catch (err) {
        console.error("Dropdown load error:", err);
        setCourses([]);
        setBatches([]);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/reports/students", {
        params: filters,
      });

      console.log("STUDENT REPORT API:", res.data);

      const arr = res.data?.students || [];
      setStudents(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Student report fetch error:", err);
      setError("Failed to load student report.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const exportRows = useMemo(() => {
    return (students || []).map((s) => ({
      Name: s?.name || "",
      Email: s?.email || "",
      Phone: s?.phone || "",
      Course: s?.course?.title || "",
      Batch: s?.batch?.name || "",
      Status: s?.status || "",
    }));
  }, [students]);

  const getStatusBadge = (status) => {
    const st = (status || "").toLowerCase();

    if (st === "active") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
    if (st === "inactive") {
      return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
    }
    if (st === "completed") {
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
    }

    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  };

  return (
    <div className="p-6 space-y-6">
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
              Student Report
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Filter students by course, batch, status and export instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudents}
              className="
                inline-flex items-center gap-2
                px-4 py-2.5 rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-sm font-semibold text-slate-700 dark:text-slate-200
                shadow-sm transition-all duration-300
                hover:shadow-lg hover:-translate-y-[1px]
                active:translate-y-0
              "
            >
              <RefreshCcw size={16} />
              Refresh
            </button>

            <ExportCSVButton rows={exportRows} filename="student-report.csv" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

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
                Filters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Apply filters to generate the report
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {students?.length || 0} results
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
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
              placeholder="Search by name, email or phone..."
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

          <select
            value={filters.course}
            disabled={loadingDropdowns}
            onChange={(e) =>
              setFilters((p) => ({ ...p, course: e.target.value }))
            }
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <option value="">
              {loadingDropdowns ? "Loading courses..." : "All Courses"}
            </option>
            {(courses || []).map((c) => (
              <option key={c?._id} value={c?._id}>
                {c?.title || "Course"}
              </option>
            ))}
          </select>

          <select
            value={filters.batch}
            disabled={loadingDropdowns}
            onChange={(e) =>
              setFilters((p) => ({ ...p, batch: e.target.value }))
            }
            className="
              px-3 py-2.5 rounded-2xl
              border border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-sm text-slate-800 dark:text-slate-100
              shadow-sm transition-all duration-300
              hover:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <option value="">
              {loadingDropdowns ? "Loading batches..." : "All Batches"}
            </option>
            {(batches || []).map((b) => (
              <option key={b?._id} value={b?._id}>
                {b?.name || "Batch"}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
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
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
          </select>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={() =>
                setFilters({ course: "", batch: "", status: "", search: "" })
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
              Reset
            </button>

            <button
              onClick={fetchStudents}
              className="
                px-5 py-2.5 rounded-2xl
                bg-indigo-600 text-white
                text-sm font-semibold
                shadow-sm transition-all duration-300
                hover:shadow-xl hover:-translate-y-[1px] hover:bg-indigo-500
                active:translate-y-0
              "
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

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
            Students List
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {students?.length || 0}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-300">
            Loading report...
          </div>
        ) : (students || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No students found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Try changing filters and click “Apply Filters”.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Name
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Email
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Phone
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Course
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Batch
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {(students || []).map((s) => (
                  <tr
                    key={s?._id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {s?.name || "-"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {s?.email || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {s?.phone || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {s?.course?.title || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {s?.batch?.name || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                          s?.status,
                        )}`}
                      >
                        {s?.status || "unknown"}
                      </span>
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

export default StudentReport;
