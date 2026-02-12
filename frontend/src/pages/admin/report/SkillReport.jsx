import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import { Search, RefreshCcw, Filter } from "lucide-react";

const SkillReport = () => {
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // active / inactive
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("title"); // title / category / level / status
  const [sortOrder, setSortOrder] = useState("asc"); // asc / desc

  // =========================
  // Fetch skills
  // =========================
  const loadSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/skills/all");

      console.log("SKILL REPORT API:", res.data);

      const arr = res.data?.skills || res.data || [];
      setSkills(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Skill report fetch error:", err);
      setError("Failed to load skills.");
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  // =========================
  // Unique dropdown values
  // =========================
  const categories = useMemo(() => {
    const set = new Set();
    for (const s of skills || []) if (s?.category) set.add(s.category);
    return Array.from(set);
  }, [skills]);

  const levels = useMemo(() => {
    const set = new Set();
    for (const s of skills || []) if (s?.level) set.add(s.level);
    return Array.from(set);
  }, [skills]);

  // =========================
  // Filter + Sort
  // =========================
  const filteredSkills = useMemo(() => {
    let arr = [...(skills || [])];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter((s) =>
        String(s?.title || s?.name || "")
          .toLowerCase()
          .includes(q),
      );
    }

    // Status
    if (status) {
      arr = arr.filter((s) =>
        status === "active" ? s?.isActive : !s?.isActive,
      );
    }

    // Category
    if (category) {
      arr = arr.filter((s) => String(s?.category || "") === category);
    }

    // Level
    if (level) {
      arr = arr.filter((s) => String(s?.level || "") === level);
    }

    // Sort
    arr.sort((a, b) => {
      const getVal = (obj) => {
        if (sortBy === "title") return obj?.title || obj?.name || "";
        if (sortBy === "category") return obj?.category || "";
        if (sortBy === "level") return obj?.level || "";
        if (sortBy === "status") return obj?.isActive ? "active" : "inactive";
        return "";
      };

      const A = String(getVal(a)).toLowerCase();
      const B = String(getVal(b)).toLowerCase();

      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [skills, search, status, category, level, sortBy, sortOrder]);

  // =========================
  // Export rows (filtered)
  // =========================
  const exportRows = useMemo(() => {
    return (filteredSkills || []).map((s) => ({
      Skill: s?.title || s?.name || "",
      Category: s?.category || "",
      Level: s?.level || "",
      Status: s?.isActive ? "active" : "inactive",
    }));
  }, [filteredSkills]);

  // =========================
  // Badge helper
  // =========================
  const getStatusBadge = (isActive) => {
    if (isActive) {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
    return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
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
              Skill Report
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Filter skills by category, level, status and export instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSkills}
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

            <ExportCSVButton rows={exportRows} filename="skill-report.csv" />
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
                Filters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Apply filters to generate the report
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredSkills?.length || 0} results
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name..."
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

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Level */}
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
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
            <option value="">All Levels</option>
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
            <option value="title">Sort by Skill</option>
            <option value="category">Sort by Category</option>
            <option value="level">Sort by Level</option>
            <option value="status">Sort by Status</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
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
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          {/* Buttons */}
          <div className="md:col-span-4 flex justify-end gap-3">
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setCategory("");
                setLevel("");
                setSortBy("title");
                setSortOrder("asc");
              }}
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
            Skills List
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredSkills?.length || 0}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-300">
            Loading report...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No skills found
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
                    Skill
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Category
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Level
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSkills.map((s) => (
                  <tr
                    key={s?._id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {s?.title || s?.name || "-"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {s?.category || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200">
                      {s?.level || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          s?.isActive,
                        )}`}
                      >
                        {s?.isActive ? "Active" : "Inactive"}
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

export default SkillReport;
