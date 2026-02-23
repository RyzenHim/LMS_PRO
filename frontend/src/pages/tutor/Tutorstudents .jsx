import { useState, useEffect } from "react";
import { Search, X, Users } from "lucide-react";
import { tutorService } from "../../services/tutorService";
import Pagination from "../../components/Pagination";

const TutorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [page, setPage] = useState(1);

  // Load batches from dashboard for the dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await tutorService.getMyDashboard();
        const d = res?.data ?? res;
        setBatches(d?.batches ?? []);
      } catch {}
    };
    load();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      if (filterStatus) params.status = filterStatus;
      if (filterBatch) params.batch = filterBatch;

      const res = await tutorService.getMyStudents(params);
      const data = res?.data ?? res;
      setStudents(data?.students ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotal(data?.totalStudents ?? 0);
    } catch (err) {
      console.error("Fetch students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, filterStatus, filterBatch]);
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterBatch]);

  const selectCls =
    "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

  return (
    <div className="space-y-5 p-1">
      {/* Header */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 shrink-0">
            <Users size={20} className="text-[#3F72AF]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#112D4E] dark:text-slate-100">
              My Students
            </h1>
            <p className="text-xs text-[#3F72AF] dark:text-slate-400 mt-0.5">
              Students enrolled in your batches
              {total > 0 && (
                <span className="ml-2 font-semibold">· {total} total</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-[#3F72AF]/30 transition">
          <Search
            size={15}
            className="text-[#3F72AF] dark:text-slate-500 shrink-0"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-sm text-[#112D4E] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectCls}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {batches.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                Batch
              </label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className={selectCls}
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {(filterStatus || filterBatch || search) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterStatus("");
              setFilterBatch("");
            }}
            className="text-xs text-red-500 dark:text-red-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#101010] rounded-2xl border border-[#DBE2EF] dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400 dark:text-slate-500">
            No students found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF]/50 dark:bg-[#1a1a1a] border-b border-[#DBE2EF] dark:border-slate-800">
                <tr>
                  {[
                    "Student",
                    "Email",
                    "Phone",
                    "Batch",
                    "Course",
                    "Status",
                    "Enrolled On",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DBE2EF] dark:divide-slate-800">
                {students.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-[#F9F7F7] dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#3F72AF]">
                            {(s.name || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-[#112D4E] dark:text-slate-100">
                          {s.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                      {s.email || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {s.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                      {s.batch?.name || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {s.course?.title || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : s.status === "suspended"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                        }`}
                      >
                        {s.status || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {s.enrollmentDate
                        ? new Date(s.enrollmentDate).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default TutorStudents;
