import { useEffect, useMemo, useState } from "react";
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
  SlidersHorizontal,
  Users,
  ChevronDown,
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

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [courses, setCourses] = useState([]);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const [createdFilter, setCreatedFilter] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewVisitor, setViewVisitor] = useState(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteVisitor, setDeleteVisitor] = useState(null);

  const [openConvertModal, setOpenConvertModal] = useState(false);
  const [convertVisitor, setConvertVisitor] = useState(null);

  const [openNotInterestedModal, setOpenNotInterestedModal] = useState(false);
  const [notInterestedVisitor, setNotInterestedVisitor] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosInstance.get("/courses/all");
        const list = res.data?.courses || res.data || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleSort = (field) => {
    if (tableLoading) return;
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const SortableHeader = ({ label, field }) => {
    const active = sortBy === field;
    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        disabled={tableLoading}
        className={`inline-flex items-center gap-1.5 select-none transition font-medium text-xs uppercase tracking-wider ${
          tableLoading
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:opacity-80"
        } ${active ? "text-[#3F72AF] dark:text-[#7aa8d8]" : "text-slate-500 dark:text-slate-400"}`}
      >
        <span>{label}</span>
        <span className="text-[10px]">
          {active ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    );
  };

  const buildParams = () => {
    const params = { page, limit: 10, search, sortBy, sortOrder };
    if (filterStatus) params.status = filterStatus;
    if (filterSource) params.source = filterSource;
    if (filterCourse) params.course = filterCourse;
    if (createdFilter) {
      params.created = createdFilter;
      if (createdFilter === "custom") {
        if (customFrom) params.from = customFrom;
        if (customTo) params.to = customTo;
      }
    }
    return params;
  };

  const fetchVisitors = async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    else setTableLoading(true);
    setError("");
    try {
      const params = buildParams();
      const tabApiMap = {
        active: getVisitorsApi,
        "not-interested": getNotInterestedVisitorsApi,
        "follow-up": getFollowUpVisitorsApi,
        converted: getConvertedVisitorsApi,
        trash: getTrashVisitorsApi,
      };
      const apiFn = tabApiMap[activeTab];
      const data = await apiFn(params);
      setVisitors(data?.visitors || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err?.message || "Failed to load visitors");
    } finally {
      if (initial) setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    fetchVisitors({ initial: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterStatus,
    filterSource,
    filterCourse,
    createdFilter,
    customFrom,
    customTo,
  ]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filterStatus)
      chips.push({ key: "status", label: `Status: ${filterStatus}` });
    if (filterSource)
      chips.push({ key: "source", label: `Source: ${filterSource}` });
    if (filterCourse) {
      const courseName =
        courses.find((c) => c._id === filterCourse)?.title || filterCourse;
      chips.push({ key: "course", label: `Course: ${courseName}` });
    }
    if (createdFilter) {
      if (createdFilter === "custom") {
        chips.push({
          key: "created",
          label: `Created: ${customFrom || "?"} → ${customTo || "?"}`,
        });
      } else {
        chips.push({ key: "created", label: `Created: ${createdFilter}` });
      }
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

  const clearSingleFilter = (key) => {
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

  const clearAllFilters = () => {
    setFilterStatus("");
    setFilterSource("");
    setFilterCourse("");
    setCreatedFilter("");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  const handleDeleteClick = (visitor) => {
    setDeleteVisitor(visitor);
    setOpenDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      setTableLoading(true);
      await deleteVisitorApi(deleteVisitor._id);
      await fetchVisitors({ initial: false });
      setOpenDeleteModal(false);
      setDeleteVisitor(null);
    } catch (err) {
      alert(err?.message || "Failed to delete visitor");
      setTableLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setTableLoading(true);
      await restoreVisitorApi(id);
      await fetchVisitors({ initial: false });
    } catch (err) {
      alert(err?.message || "Failed to recover visitor");
      setTableLoading(false);
    }
  };

  const handleView = (visitor) => {
    setViewVisitor(visitor);
    setOpenViewModal(true);
  };
  const handleConvertClick = (visitor) => {
    setConvertVisitor(visitor);
    setOpenConvertModal(true);
  };

  const handleConvertSuccess = async () => {
    await fetchVisitors({ initial: false });
    setOpenConvertModal(false);
    setConvertVisitor(null);
  };

  const handleNotInterestedClick = (visitor) => {
    setNotInterestedVisitor(visitor);
    setOpenNotInterestedModal(true);
  };

  const handleNotInterestedSuccess = async () => {
    await fetchVisitors({ initial: false });
    setOpenNotInterestedModal(false);
    setNotInterestedVisitor(null);
  };

  // Status pill — schema enum: new | contacted | converted | not-interested | follow-up
  const statusPill = (status) => {
    const s = String(status || "new").toLowerCase();
    const map = {
      new: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-600",
      contacted:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
      "follow-up":
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
      "not-interested":
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
      converted:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    };
    return (
      map[s] ||
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/60 dark:text-slate-300 dark:border-slate-600"
    );
  };

  const selectCls =
    "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";
  const inputCls =
    "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

  const tabs = [
    { key: "active", label: "Active", icon: Users },
    { key: "not-interested", label: "Not Interested", icon: XCircle },
    { key: "follow-up", label: "Follow-up", icon: Clock },
    { key: "converted", label: "Converted", icon: CheckCircle },
    { key: "trash", label: "Trash", icon: Trash2 },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#3F72AF] dark:text-[#DBE2EF]">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading visitors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Visitors
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage leads, follow-ups, conversions, and trash
            </p>
          </div>
          {activeTab === "active" && (
            <button
              onClick={() => setOpenModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold shadow-sm transition"
            >
              <Plus size={16} />
              Add Visitor
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                disabled={tableLoading}
                onClick={() => {
                  setActiveTab(t.key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition whitespace-nowrap ${
                  tableLoading ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  active
                    ? "bg-[#3F72AF] text-white border-[#3F72AF] shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, phone, source, status..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <SlidersHorizontal size={13} />
          Filters
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Status — enum: new | contacted | converted | not-interested | follow-up */}
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

          {/* Source — enum: call | walk-in | email | referral | other */}
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

          {createdFilter === "custom" ? (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => {
                  setCustomFrom(e.target.value);
                  setPage(1);
                }}
                className={inputCls}
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
                className={inputCls}
              />
            </>
          ) : (
            <div className="xl:col-span-2" />
          )}
        </div>

        {/* Filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearSingleFilter(chip.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#3F72AF]/10 text-[#3F72AF] dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8] border border-[#3F72AF]/20 hover:bg-[#3F72AF]/20 transition"
              >
                {chip.label}
                <XCircle size={12} />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 shadow-lg">
              <div className="w-4 h-4 border-2 border-[#3F72AF] border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </div>
        )}

        {visitors.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-16 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              No visitors found
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-3.5 text-left">
                    <SortableHeader label="Name" field="name" />
                  </th>
                  <th className="px-4 py-3.5 text-left">
                    <SortableHeader label="Email" field="email" />
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    Phone
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    Course
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    Source
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  {activeTab === "not-interested" && (
                    <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                      Reason
                    </th>
                  )}
                  {activeTab === "follow-up" && (
                    <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                      Follow-up Date
                    </th>
                  )}
                  {activeTab === "converted" && (
                    <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                      Converted To
                    </th>
                  )}
                  <th className="px-4 py-3.5 text-left">
                    <SortableHeader label="Created" field="createdAt" />
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {visitors.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {v.name}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 dark:text-slate-300">
                        {v.email || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {v.phone || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {v.course?.title || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 dark:text-slate-300 capitalize whitespace-nowrap">
                        {v.source || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusPill(v.status)}`}
                      >
                        {v.status || "new"}
                      </span>
                    </td>

                    {activeTab === "not-interested" && (
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 block">
                          {v.notInterestedReason || "—"}
                        </span>
                      </td>
                    )}

                    {activeTab === "follow-up" && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-200">
                          {v.followUpDate
                            ? new Date(v.followUpDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                    )}

                    {activeTab === "converted" && (
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {/* conversionType enum: student | tutor | employee | null */}
                        {v.conversionType ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700 capitalize">
                            {v.conversionType}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-slate-600 dark:text-slate-300">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition text-xs font-semibold"
                        >
                          <RotateCcw size={13} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(v)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#3F72AF] dark:hover:text-[#7aa8d8] transition"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          {activeTab === "active" && (
                            <>
                              <button
                                onClick={() => handleConvertClick(v)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                title="Convert to Student"
                              >
                                <UserPlus size={15} />
                              </button>

                              <button
                                onClick={() => handleNotInterestedClick(v)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition"
                                title="Mark Not Interested"
                              >
                                <XCircle size={15} />
                              </button>

                              <button
                                onClick={() => handleDeleteClick(v)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                                title="Move to Trash"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className={tableLoading ? "opacity-60 pointer-events-none" : ""}>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* MODALS */}
      <AddVisitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          fetchVisitors({ initial: false });
          setOpenModal(false);
        }}
      />

      <EditVisitorModal
        open={openEditModal}
        visitor={editVisitor}
        onClose={() => {
          setOpenEditModal(false);
          setEditVisitor(null);
        }}
        onSuccess={() => {
          fetchVisitors({ initial: false });
          setOpenEditModal(false);
          setEditVisitor(null);
        }}
      />

      <ViewVisitorModal
        open={openViewModal}
        visitor={viewVisitor}
        onClose={() => {
          setOpenViewModal(false);
          setViewVisitor(null);
        }}
      />

      <ConvertVisitorModal
        open={openConvertModal}
        visitor={convertVisitor}
        onClose={() => {
          setOpenConvertModal(false);
          setConvertVisitor(null);
        }}
        onSuccess={handleConvertSuccess}
      />

      <NotInterestedModal
        open={openNotInterestedModal}
        visitor={notInterestedVisitor}
        onClose={() => {
          setOpenNotInterestedModal(false);
          setNotInterestedVisitor(null);
        }}
        onSuccess={handleNotInterestedSuccess}
      />

      <ConfirmDeleteModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
          setDeleteVisitor(null);
        }}
        onConfirm={handleDelete}
        title={deleteVisitor?.name}
      />
    </div>
  );
};

export default Visitors;
