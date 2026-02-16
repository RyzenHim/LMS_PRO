import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../../api/axios";
import ExportCSVButton from "./components/ExportCSVButton";
import { Filter, Search, RefreshCcw, Wallet } from "lucide-react";

const FeeReport = () => {
  const [fees, setFees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    minAmount: "",
    maxAmount: "",
    fromDate: "",
    toDate: "",
    sortBy: "paidOn",
    sortOrder: "desc",
  });

  // =========================
  // Helpers
  // =========================
  const safeArr = (x) => (Array.isArray(x) ? x : []);

  const toDateOnly = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const getStudentName = (f) => f?.student?.visitor?.name || "";
  const getStudentEmail = (f) => f?.student?.visitor?.email || "";

  const getAmount = (f) => {
    const a = Number(f?.amountPaid ?? 0);
    return Number.isNaN(a) ? 0 : a;
  };

  const getPaidOnTime = (f) => {
    if (!f?.createdAt) return null;
    const t = new Date(f.createdAt).getTime();
    return Number.isNaN(t) ? null : t;
  };

  // =========================
  // Load fees
  // =========================
  const fetchFees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.get("/reports/fees", {
        params: {
          status: filters.status || "",
          search: filters.search || "",
          from: filters.fromDate || "",
          to: filters.toDate || "",
        },
      });

      console.log("FEES API:", res.data);

      const arr = res.data?.fees || res.data || [];
      setFees(safeArr(arr));
    } catch (err) {
      console.error(err);
      setError("Failed to load fees.");
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // =========================
  // Filter + Sort
  // =========================
  const filteredFees = useMemo(() => {
    let list = safeArr(fees);

    // Search (name/email)
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter((f) => {
        const name = getStudentName(f).toLowerCase();
        const email = getStudentEmail(f).toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    // Status
    if (filters.status) {
      list = list.filter(
        (f) => (f?.status || "").toLowerCase() === filters.status,
      );
    }

    // Amount range
    const minAmount =
      filters.minAmount === "" ? null : Number(filters.minAmount);
    const maxAmount =
      filters.maxAmount === "" ? null : Number(filters.maxAmount);

    if (minAmount !== null && !Number.isNaN(minAmount)) {
      list = list.filter((f) => getAmount(f) >= minAmount);
    }
    if (maxAmount !== null && !Number.isNaN(maxAmount)) {
      list = list.filter((f) => getAmount(f) <= maxAmount);
    }

    // Date range
    const fromTime = filters.fromDate
      ? new Date(filters.fromDate).getTime()
      : null;
    const toTime = filters.toDate ? new Date(filters.toDate).getTime() : null;

    if (fromTime && !Number.isNaN(fromTime)) {
      list = list.filter((f) => {
        const t = getPaidOnTime(f);
        return t !== null ? t >= fromTime : false;
      });
    }

    if (toTime && !Number.isNaN(toTime)) {
      list = list.filter((f) => {
        const t = getPaidOnTime(f);
        return t !== null ? t <= toTime : false;
      });
    }

    // Sorting
    const order = filters.sortOrder === "asc" ? 1 : -1;

    list = [...list].sort((a, b) => {
      if (filters.sortBy === "paidOn") {
        const at = getPaidOnTime(a) ?? 0;
        const bt = getPaidOnTime(b) ?? 0;
        return (at - bt) * order;
      }

      if (filters.sortBy === "amount") {
        return (getAmount(a) - getAmount(b)) * order;
      }

      if (filters.sortBy === "student") {
        return getStudentName(a).localeCompare(getStudentName(b)) * order;
      }

      if (filters.sortBy === "status") {
        return (a?.status || "").localeCompare(b?.status || "") * order;
      }

      return 0;
    });

    return list;
  }, [fees, filters]);

  // =========================
  // Export (filtered)
  // =========================
  const exportRows = useMemo(() => {
    return safeArr(filteredFees).map((f) => ({
      Student: f?.student?.visitor?.name || "",
      Email: f?.student?.visitor?.email || "",
      AmountPaid: f?.amountPaid ?? "",
      TotalFees: f?.coursePrice ?? "",
      RemainingAmount: f?.remainingAmount ?? "",
      Status: f?.status || "",
      Date: f?.createdAt ? new Date(f.createdAt).toLocaleDateString() : "",
    }));
  }, [filteredFees]);

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
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <Wallet
                size={20}
                className="text-slate-700 dark:text-slate-200"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Fees Report
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                Filter fees by student, status, amount, date range and export
                CSV.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchFees}
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

            <ExportCSVButton rows={exportRows} filename="fees-report.csv" />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm shadow-sm">
          {error}
        </div>
      )}

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
                Search, amount range, paid date range, status
              </p>
            </div>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredFees?.length || 0} records
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
              placeholder="Search student name / email..."
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
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Min amount */}
          <input
            value={filters.minAmount}
            onChange={(e) =>
              setFilters((p) => ({ ...p, minAmount: e.target.value }))
            }
            placeholder="Min amount"
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

          {/* Max amount */}
          <input
            value={filters.maxAmount}
            onChange={(e) =>
              setFilters((p) => ({ ...p, maxAmount: e.target.value }))
            }
            placeholder="Max amount"
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

          {/* From date */}
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, fromDate: e.target.value }))
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
          />

          {/* To date */}
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, toDate: e.target.value }))
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
            <option value="paidOn">Sort: Paid Date</option>
            <option value="amount">Sort: Amount</option>
            <option value="student">Sort: Student</option>
            <option value="status">Sort: Status</option>
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
            <option value="desc">Order: Descending</option>
            <option value="asc">Order: Ascending</option>
          </select>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  status: "",
                  minAmount: "",
                  maxAmount: "",
                  fromDate: "",
                  toDate: "",
                  sortBy: "paidOn",
                  sortOrder: "desc",
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
            <button
              onClick={fetchFees}
              className="
                px-4 py-2.5 rounded-2xl
                bg-indigo-600 text-white
                text-sm font-semibold
                shadow-sm transition-all duration-300
                hover:shadow-xl hover:-translate-y-[1px] hover:bg-indigo-500
                active:translate-y-0
              "
            >
              Apply
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
            Fees Records
          </h2>

          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
            {filteredFees?.length || 0}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-300">
            Loading fees...
          </div>
        ) : (filteredFees || []).length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No fees records found
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
                    Student
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Email
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Amount
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                    Paid On
                  </th>
                </tr>
              </thead>

              <tbody>
                {(filteredFees || []).map((f) => (
                  <tr
                    key={f?._id}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                      {f?.student?.visitor?.name || "-"}
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {f?.student?.visitor?.email || "-"}
                    </td>

                    <td className="p-4 text-slate-700 dark:text-slate-200 font-medium">
                      ₹{f?.amountPaid ?? "-"}
                    </td>

                    <td className="p-4 capitalize">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            (f?.status || "").toLowerCase() === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : (f?.status || "").toLowerCase() === "partial"
                                ? "bg-amber-100 text-amber-700"
                                : (f?.status || "").toLowerCase() === "unpaid"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          }
                        `}
                      >
                        {f?.status || "-"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {f?.createdAt ? toDateOnly(f.createdAt) : "-"}
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

export default FeeReport;
