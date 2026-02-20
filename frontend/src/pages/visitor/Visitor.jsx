import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  UserPlus,
  XCircle,
  Clock,
  CheckCircle,
  Users,
  Phone,
  Mail,
  BookOpen,
  TrendingUp,
  AlertCircle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarCheck2,
  Filter,
} from "lucide-react";

import AddVisitorModal from "./modal/AddVisitorModal";
import EditVisitorModal from "./modal/EditVisitorModal";
import ViewVisitorModal from "./modal/ViewVisitorModal";
import ConvertVisitorModal from "./modal/ConvertVisitorModal";
import NotInterestedModal from "./modal/NotInterestedModal";
import ConfirmDeleteModal from "../admin/modal/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";
import axiosInstance from "../../api/axios";

import {
  getVisitorsApi,
  getNotInterestedVisitorsApi,
  getFollowUpVisitorsApi,
  getConvertedVisitorsApi,
  getTrashVisitorsApi,
  deleteVisitorApi,
  restoreVisitorApi,
} from "../../services/visitorService";

// ══════════════════════════════════════════════════════
// CONSTANTS — all defined outside component
// ══════════════════════════════════════════════════════

const TABS = [
  { key: "active", label: "Active", icon: Users, color: "blue" },
  {
    key: "not-interested",
    label: "Not Interested",
    icon: XCircle,
    color: "orange",
  },
  { key: "follow-up", label: "Follow-up", icon: Clock, color: "amber" },
  { key: "converted", label: "Converted", icon: CheckCircle, color: "green" },
  { key: "trash", label: "Trash", icon: Trash2, color: "red" },
];

const TAB_ACTIVE = {
  blue: "bg-[#3F72AF] text-white border-[#3F72AF] shadow-sm shadow-[#3F72AF]/20",
  orange:
    "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20",
  amber:
    "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20",
  green:
    "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20",
  red: "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/20",
};

// Status pill — enum: new | contacted | converted | not-interested | follow-up
const STATUS_STYLES = {
  new: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/60 dark:text-slate-200 dark:border-slate-600",
  contacted:
    "bg-[#3F72AF]/10 text-[#3F72AF] border-[#3F72AF]/20 dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8] dark:border-[#3F72AF]/30",
  "follow-up":
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/60",
  "not-interested":
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/60",
  converted:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/60",
};

// Source pill — enum: call | walk-in | email | referral | other
const SOURCE_STYLES = {
  call: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/60",
  "walk-in":
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/60",
  email:
    "bg-[#3F72AF]/10 text-[#3F72AF] border-[#3F72AF]/20 dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8] dark:border-[#3F72AF]/30",
  referral:
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/60",
  other:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:border-slate-600",
};

// Conversion type pill — enum: student | tutor | employee
const CONVERSION_STYLES = {
  student:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700/60",
  tutor:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700/60",
  employee:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/60",
};

const getStatusPill = (s) => STATUS_STYLES[s] || STATUS_STYLES.new;
const getSourcePill = (s) => SOURCE_STYLES[s] || SOURCE_STYLES.other;

const selectCls =
  "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 transition appearance-none cursor-pointer";
const inputCls =
  "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/30 transition";

// ─── Skeleton loader ─────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[88, 170, 130, 80, 70, 90].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div
          className="h-3.5 bg-slate-200 dark:bg-slate-700/80 rounded-lg animate-pulse"
          style={{ width: w }}
        />
      </td>
    ))}
  </tr>
);

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisitors, setTotalVisitors] = useState(0);

  const [courses, setCourses] = useState([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [createdFilter, setCreatedFilter] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals — each has a boolean + data state
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openConvert, setOpenConvert] = useState(false);
  const [convertTarget, setConvertTarget] = useState(null);
  const [openNotInt, setOpenNotInt] = useState(false);
  const [notIntTarget, setNotIntTarget] = useState(null);

  // ── Debounced search (400ms) ──────────────────────
  const searchTimer = useRef(null);
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  };

  // ── Body scroll freeze when any modal is open ─────
  const anyOpen =
    openAdd || openEdit || openView || openDelete || openConvert || openNotInt;
  useEffect(() => {
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyOpen]);

  // ── Fetch course list once ────────────────────────
  useEffect(() => {
    axiosInstance
      .get("/courses/all")
      .then((r) => {
        const l = r.data?.courses || r.data || [];
        setCourses(Array.isArray(l) ? l : []);
      })
      .catch(() => {});
  }, []);

  // ── Build API params ──────────────────────────────
  const buildParams = useCallback(() => {
    const p = { page, limit: 10, search: debouncedSearch, sortBy, sortOrder };
    if (filterStatus) p.status = filterStatus;
    if (filterSource) p.source = filterSource;
    if (filterCourse) p.course = filterCourse;
    if (createdFilter) {
      p.created = createdFilter;
      if (createdFilter === "custom") {
        if (customFrom) p.from = customFrom;
        if (customTo) p.to = customTo;
      }
    }
    return p;
  }, [
    page,
    debouncedSearch,
    sortBy,
    sortOrder,
    filterStatus,
    filterSource,
    filterCourse,
    createdFilter,
    customFrom,
    customTo,
  ]);

  const TAB_API = {
    active: getVisitorsApi,
    "not-interested": getNotInterestedVisitorsApi,
    "follow-up": getFollowUpVisitorsApi,
    converted: getConvertedVisitorsApi,
    trash: getTrashVisitorsApi,
  };

  // ── Fetch visitors ────────────────────────────────
  const fetchVisitors = useCallback(
    async ({ initial = false } = {}) => {
      if (initial) setLoading(true);
      else setTableLoading(true);
      setError("");
      try {
        const data = await TAB_API[activeTab](buildParams());
        setVisitors(data?.visitors || []);
        setTotalPages(data?.totalPages || 1);
        setTotalVisitors(data?.totalVisitors || 0);
      } catch (err) {
        setError(err?.message || "Failed to load visitors");
      } finally {
        if (initial) setLoading(false);
        else setTableLoading(false);
      }
    },
    [activeTab, buildParams],
  );

  useEffect(() => {
    fetchVisitors({ initial: true });
  }, []);
  useEffect(() => {
    if (!loading) fetchVisitors();
  }, [
    activeTab,
    page,
    debouncedSearch,
    sortBy,
    sortOrder,
    filterStatus,
    filterSource,
    filterCourse,
    createdFilter,
    customFrom,
    customTo,
  ]);

  // ── Sorting ───────────────────────────────────────
  const handleSort = (field) => {
    if (tableLoading) return;
    if (sortBy === field) setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  // ── Filter chips ──────────────────────────────────
  const activeFilterCount = [
    filterStatus,
    filterSource,
    filterCourse,
    createdFilter,
  ].filter(Boolean).length;

  const activeChips = useMemo(() => {
    const chips = [];
    if (filterStatus)
      chips.push({ key: "status", label: `Status: ${filterStatus}` });
    if (filterSource)
      chips.push({ key: "source", label: `Source: ${filterSource}` });
    if (filterCourse) {
      const name =
        courses.find((c) => c._id === filterCourse)?.title || "Course";
      chips.push({ key: "course", label: name });
    }
    if (createdFilter) {
      const map = {
        today: "Today",
        yesterday: "Yesterday",
        last7days: "Last 7 Days",
        last30days: "Last 30 Days",
        thisMonth: "This Month",
        custom: `${customFrom || "?"} → ${customTo || "?"}`,
      };
      chips.push({
        key: "created",
        label: map[createdFilter] || createdFilter,
      });
    }
    return chips;
  }, [
    filterStatus,
    filterSource,
    filterCourse,
    createdFilter,
    customFrom,
    customTo,
    courses,
  ]);

  const clearFilter = (key) => {
    if (key === "status") setFilterStatus("");
    if (key === "source") setFilterSource("");
    if (key === "course") setFilterCourse("");
    if (key === "created") {
      setCreatedFilter("");
      setCustomFrom("");
      setCustomTo("");
    }
    setPage(1);
  };
  const clearAll = () => {
    setFilterStatus("");
    setFilterSource("");
    setFilterCourse("");
    setCreatedFilter("");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  // ── Delete (soft) ─────────────────────────────────
  const handleDelete = async () => {
    try {
      setTableLoading(true);
      await deleteVisitorApi(deleteTarget._id);
      await fetchVisitors();
      setOpenDelete(false);
      setDeleteTarget(null);
    } catch (err) {
      // surface error inline
      setError(err?.message || "Failed to move to trash");
      setTableLoading(false);
    }
  };

  // ── Restore ───────────────────────────────────────
  const handleRestore = async (id) => {
    try {
      setTableLoading(true);
      await restoreVisitorApi(id);
      await fetchVisitors();
    } catch (err) {
      setError(err?.message || "Failed to restore visitor");
      setTableLoading(false);
    }
  };

  // ─── Sort header ──────────────────────────────────
  const SortHeader = ({ label, field }) => {
    const active = sortBy === field;
    const Icon = !active
      ? ArrowUpDown
      : sortOrder === "asc"
        ? ArrowUp
        : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        disabled={tableLoading}
        className={`inline-flex items-center gap-1.5 select-none transition font-semibold text-xs uppercase tracking-wider disabled:cursor-not-allowed ${active ? "text-[#3F72AF] dark:text-[#7aa8d8]" : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"}`}
      >
        {label} <Icon size={11} className="shrink-0" />
      </button>
    );
  };

  const StaticHeader = ({ label }) => (
    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
    </span>
  );

  // ─── Initial full-page skeleton ───────────────────
  if (loading) {
    return (
      <div className="p-5 space-y-4 max-w-[1400px] mx-auto">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-1.5" />
          <div className="h-3.5 w-52 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mb-5" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4 max-w-[1400px] mx-auto">
      {/* ══ HEADER ══ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/15 shrink-0">
              <Users size={20} className="text-[#3F72AF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Visitors
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage leads, follow-ups and conversions
                {totalVisitors > 0 && (
                  <span className="ml-2 font-bold text-[#3F72AF] dark:text-[#7aa8d8]">
                    · {totalVisitors.toLocaleString()} total
                  </span>
                )}
              </p>
            </div>
          </div>
          {activeTab === "active" && (
            <button
              onClick={() => setOpenAdd(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold shadow-sm shadow-[#3F72AF]/20 transition active:scale-95 shrink-0"
            >
              <Plus size={16} />
              Add Visitor
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-0.5 -mb-0.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                disabled={tableLoading}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 ${
                  isActive
                    ? TAB_ACTIVE[t.color]
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                }`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ SEARCH + FILTERS ══ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          {/* Search input */}
          <div className="flex-1 flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 focus-within:ring-2 focus-within:ring-[#3F72AF]/30 focus-within:border-[#3F72AF]/40 dark:focus-within:border-[#3F72AF]/40 transition">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, phone, source, status..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition active:scale-95 ${
              showFilters || activeFilterCount > 0
                ? "bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 border-[#3F72AF]/30 dark:border-[#3F72AF]/40 text-[#3F72AF] dark:text-[#7aa8d8]"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#3F72AF] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Source
                </label>
                <select
                  value={filterSource}
                  onChange={(e) => {
                    setFilterSource(e.target.value);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Sources</option>
                  <option value="call">Call</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="email">Email</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Course
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date Added
                </label>
                <select
                  value={createdFilter}
                  onChange={(e) => {
                    setCreatedFilter(e.target.value);
                    setCustomFrom("");
                    setCustomTo("");
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sort By
                </label>
                <select
                  value={`${sortBy}__${sortOrder}`}
                  onChange={(e) => {
                    const [f, o] = e.target.value.split("__");
                    setSortBy(f);
                    setSortOrder(o);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="createdAt__desc">Newest First</option>
                  <option value="createdAt__asc">Oldest First</option>
                  <option value="name__asc">Name A → Z</option>
                  <option value="name__desc">Name Z → A</option>
                  <option value="status__asc">Status A → Z</option>
                  <option value="followUpDate__asc">Follow-up ↑</option>
                  <option value="followUpDate__desc">Follow-up ↓</option>
                </select>
              </div>
            </div>

            {/* Custom date range */}
            {createdFilter === "custom" && (
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => {
                      setCustomFrom(e.target.value);
                      setPage(1);
                    }}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => {
                      setCustomTo(e.target.value);
                      setPage(1);
                    }}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active:
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#3F72AF]/10 text-[#3F72AF] dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8] border border-[#3F72AF]/20 dark:border-[#3F72AF]/30 hover:bg-[#3F72AF]/20 transition"
              >
                {chip.label} <X size={10} />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-500 underline transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ══ ERROR ══ */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-400 hover:text-red-600 transition shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ══ TABLE ══ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left">
                  <SortHeader label="Name" field="name" />
                </th>
                <th className="px-4 py-3.5 text-left">
                  <StaticHeader label="Contact" />
                </th>
                <th className="px-4 py-3.5 text-left">
                  <StaticHeader label="Course" />
                </th>
                <th className="px-4 py-3.5 text-left">
                  <StaticHeader label="Source" />
                </th>
                <th className="px-4 py-3.5 text-left">
                  <SortHeader label="Status" field="status" />
                </th>
                {activeTab === "not-interested" && (
                  <th className="px-4 py-3.5 text-left">
                    <StaticHeader label="Reason" />
                  </th>
                )}
                {activeTab === "follow-up" && (
                  <th className="px-4 py-3.5 text-left">
                    <SortHeader label="Follow-up" field="followUpDate" />
                  </th>
                )}
                {activeTab === "converted" && (
                  <th className="px-4 py-3.5 text-left">
                    <StaticHeader label="Converted To" />
                  </th>
                )}
                <th className="px-4 py-3.5 text-left">
                  <SortHeader label="Added" field="createdAt" />
                </th>
                <th className="px-4 py-3.5 text-left">
                  <StaticHeader label="Actions" />
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
              {/* Loading state */}
              {tableLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : visitors.length === 0 ? (
                /* Empty state */
                <tr>
                  <td colSpan={10}>
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users
                          size={24}
                          className="text-slate-300 dark:text-slate-600"
                        />
                      </div>
                      <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                        No visitors found
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data rows */
                visitors.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-[#3F72AF]/5 dark:hover:bg-[#3F72AF]/5 transition-colors group"
                  >
                    {/* Name + avatar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 border border-[#3F72AF]/15 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-[#3F72AF]">
                            {(v.name || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {v.name}
                        </span>
                      </div>
                    </td>

                    {/* Contact — email + phone combined */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {v.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                              {v.email}
                            </span>
                          </div>
                        )}
                        {v.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {v.phone}
                            </span>
                          </div>
                        )}
                        {!v.email && !v.phone && (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3.5">
                      {v.course?.title ? (
                        <div className="flex items-center gap-1.5">
                          <BookOpen
                            size={11}
                            className="text-[#3F72AF]/50 shrink-0"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[130px] truncate">
                            {v.course.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3.5">
                      {v.source ? (
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${getSourcePill(v.source)}`}
                        >
                          {v.source}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusPill(v.status)}`}
                      >
                        {v.status || "new"}
                      </span>
                    </td>

                    {/* Not interested reason */}
                    {activeTab === "not-interested" && (
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 block">
                          {v.notInterestedReason || "—"}
                        </span>
                      </td>
                    )}

                    {/* Follow-up date */}
                    {activeTab === "follow-up" && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {v.followUpDate ? (
                          <div className="flex items-center gap-1.5">
                            <CalendarCheck2
                              size={12}
                              className="text-amber-500 shrink-0"
                            />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                              {new Date(v.followUpDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    )}

                    {/* Converted to */}
                    {activeTab === "converted" && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {v.conversionType ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${CONVERSION_STYLES[v.conversionType] || CONVERSION_STYLES.student}`}
                          >
                            <TrendingUp size={9} />
                            {v.conversionType}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    )}

                    {/* Created at */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(v.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      {activeTab === "trash" ? (
                        /* Trash tab: only restore */
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-bold transition active:scale-95"
                        >
                          <RotateCcw size={12} />
                          Restore
                        </button>
                      ) : (
                        /* All other tabs: progressive actions */
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* View — always shown */}
                          <button
                            onClick={() => {
                              setViewTarget(v);
                              setOpenView(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#3F72AF]/10 dark:hover:bg-[#3F72AF]/15 text-slate-400 hover:text-[#3F72AF] dark:hover:text-[#7aa8d8] transition"
                            title="View details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit — always shown (except converted) */}
                          {activeTab !== "converted" && (
                            <button
                              onClick={() => {
                                setEditTarget(v);
                                setOpenEdit(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                              title="Edit visitor"
                            >
                              <Edit size={15} />
                            </button>
                          )}

                          {/* Convert — active tab only, non-converted visitors */}
                          {activeTab === "active" && (
                            <button
                              onClick={() => {
                                setConvertTarget(v);
                                setOpenConvert(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                              title="Convert to student"
                            >
                              <UserPlus size={15} />
                            </button>
                          )}

                          {/* Mark Not Interested — active tab only */}
                          {activeTab === "active" && (
                            <button
                              onClick={() => {
                                setNotIntTarget(v);
                                setOpenNotInt(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition"
                              title="Mark not interested"
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          {/* Delete / Move to trash — shown on active, not-interested, follow-up tabs */}
                          {["active", "not-interested", "follow-up"].includes(
                            activeTab,
                          ) && (
                            <button
                              onClick={() => {
                                setDeleteTarget(v);
                                setOpenDelete(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                              title="Move to trash"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!tableLoading && visitors.length > 0 && (
          <div className="px-4 py-3.5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      <AddVisitorModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={() => {
          fetchVisitors();
          setOpenAdd(false);
        }}
      />

      <EditVisitorModal
        open={openEdit}
        visitor={editTarget}
        onClose={() => {
          setOpenEdit(false);
          setEditTarget(null);
        }}
        onSuccess={() => {
          fetchVisitors();
          setOpenEdit(false);
          setEditTarget(null);
        }}
      />

      <ViewVisitorModal
        open={openView}
        visitor={viewTarget}
        onClose={() => {
          setOpenView(false);
          setViewTarget(null);
        }}
      />

      <ConvertVisitorModal
        open={openConvert}
        visitor={convertTarget}
        onClose={() => {
          setOpenConvert(false);
          setConvertTarget(null);
        }}
        onSuccess={() => {
          fetchVisitors();
          setOpenConvert(false);
          setConvertTarget(null);
        }}
      />

      <NotInterestedModal
        open={openNotInt}
        visitor={notIntTarget}
        onClose={() => {
          setOpenNotInt(false);
          setNotIntTarget(null);
        }}
        onSuccess={() => {
          fetchVisitors();
          setOpenNotInt(false);
          setNotIntTarget(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title={deleteTarget?.name}
      />
    </div>
  );
};

export default Visitors;
