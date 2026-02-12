import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import { Search, RefreshCcw, Filter } from "lucide-react";

const TutorReport = () => {
  const [tutors, setTutors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  // =========================
  // Fetch tutors
  // =========================
  const fetchTutors = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/tutors/all");

      console.log("TUTORS API:", res.data);

      const arr = res.data?.tutors || res.data || [];
      setTutors(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Tutor report error:", err);
      setError("Failed to load tutors.");
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  // =========================
  // Filtering + sorting (frontend)
  // =========================
  const filteredTutors = useMemo(() => {
    let list = Array.isArray(tutors) ? [...tutors] : [];

    // search
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => {
        const name = (t?.name || "").toLowerCase();
        const email = (t?.email || "").toLowerCase();
        const phone = String(t?.phone || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    // status
    if (filters.status) {
      list = list.filter((t) => {
        const isActive = !!t?.isActive;
        return filters.status === "active" ? isActive : !isActive;
      });
    }

    // sorting
    const order = filters.sortOrder === "asc" ? 1 : -1;

    list.sort((a, b) => {
      if (filters.sortBy === "name") {
        return (a?.name || "").localeCompare(b?.name || "") * order;
      }

      if (filters.sortBy === "createdAt") {
        return (
          (new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)) * order
        );
      }

      if (filters.sortBy === "status") {
        const av = a?.isActive ? 1 : 0;
        const bv = b?.isActive ? 1 : 0;
        return (av - bv) * order;
      }

      return 0;
    });

    return list;
  }, [tutors, filters]);

  // =========================
  // Export
  // =========================
  const exportRows = useMemo(() => {
    return (filteredTutors || []).map((t) => ({
      Name: t?.name || "",
      Email: t?.email || "",
      Phone: t?.phone || "",
      Status: t?.isActive ? "active" : "inactive",
      CreatedAt: t?.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    }));
  }, [filteredTutors]);

  // =========================
  // Badge helper
  // =========================
  const getStatusBadge = (isActive) => {
    return isActive
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
  };

  return (
    <div className="p-6 space-y-6">
      {/* ========================= HEADER ========================= */}
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
              Tutor Report
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Filter, sort and export tutors list.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTutors}
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

            <ExportCSVButton rows={exportRows} filename="tutor-report.csv" />
          </div>
        </div>
      </div>

      {/* ========================= ERROR ========================= */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* ========================= FILTERS ========================= */}
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
                Search tutors, filter status and sort list
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredTutors?.length || 0} results
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
              placeholder="Search by name / email / phone..."
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

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
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
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((p) => ({ ...p, sortBy: e.target.value }))
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
            <option value="name">Sort: Name</option>
            <option value="createdAt">Sort: Created Date</option>
            <option value="status">Sort: Status</option>
          </select>

          {/* Sort order */}
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

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  sortBy: "name",
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
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ========================= TABLE ========================= */}
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
            Tutors List
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredTutors?.length || 0}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-300">
            Loading tutors...
          </div>
        ) : (filteredTutors || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No tutors found
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Try changing filters.
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
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {(filteredTutors || []).map((t) => (
                  <tr
                    key={t?._id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {t?.name || "-"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {t?.email || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {t?.phone || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          t?.isActive,
                        )}`}
                      >
                        {t?.isActive ? "Active" : "Inactive"}
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

export default TutorReport;
