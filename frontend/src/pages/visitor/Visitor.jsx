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

  // sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // dropdown data
  const [courses, setCourses] = useState([]);

  // filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // created filter
  const [createdFilter, setCreatedFilter] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // modals
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

  // =========================
  // FETCH COURSES
  // =========================
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

  // =========================
  // SORT
  // =========================
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

    const arrow =
      active && sortOrder === "asc"
        ? "▲"
        : active && sortOrder === "desc"
          ? "▼"
          : "↕";

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        disabled={tableLoading}
        className={`inline-flex items-center gap-2 select-none transition ${
          tableLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${
          active
            ? "font-semibold text-[#112D4E] dark:text-white"
            : "text-[#112D4E]/90 dark:text-[#DBE2EF]"
        }`}
      >
        <span>{label}</span>
        <span className="text-[11px] opacity-70">{arrow}</span>
      </button>
    );
  };

  // =========================
  // PARAMS BUILDER
  // =========================
  const buildParams = () => {
    const params = {
      page,
      limit: 10,
      search,
      sortBy,
      sortOrder,
    };

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

  // =========================
  // FETCH VISITORS BY TAB
  // =========================
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
      console.error("Fetch visitors error:", err);
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

  // =========================
  // FILTER CHIPS
  // =========================
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

  // =========================
  // ACTIONS
  // =========================
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

  // =========================
  // HELPERS
  // =========================
  const statusPill = (status) => {
    const s = String(status || "new").toLowerCase();

    const map = {
      new: "bg-slate-100 text-slate-700 border-slate-200",
      contacted: "bg-blue-50 text-blue-700 border-blue-200",
      "follow-up": "bg-amber-50 text-amber-700 border-amber-200",
      "not-interested": "bg-orange-50 text-orange-700 border-orange-200",
      converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    return map[s] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading visitors...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#112D4E] dark:text-[#DBE2EF]">
              Visitors
            </h1>
            <p className="text-sm text-[#3F72AF] dark:text-slate-300 mt-1">
              Manage visitor leads, follow-ups, conversions, and trash.
            </p>
          </div>

          {activeTab === "active" && (
            <button
              onClick={() => setOpenModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold shadow-lg shadow-[#3F72AF]/20 transition"
            >
              <Plus size={18} />
              Add Visitor
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "active", label: "Active" },
            {
              key: "not-interested",
              label: "Not Interested",
              icon: XCircle,
            },
            {
              key: "follow-up",
              label: "Follow-up",
              icon: Clock,
            },
            {
              key: "converted",
              label: "Converted",
              icon: CheckCircle,
            },
            { key: "trash", label: "Trash" },
          ].map((t) => {
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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium border transition whitespace-nowrap ${
                  tableLoading ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  active
                    ? "bg-[#3F72AF] text-white border-[#3F72AF] shadow-sm"
                    : "bg-white/50 dark:bg-slate-800/40 text-[#112D4E] dark:text-[#DBE2EF] border-[#DBE2EF] dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70"
                }`}
              >
                {Icon ? <Icon size={16} /> : null}
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#DBE2EF]/70 dark:bg-slate-800/70 border border-white/40 dark:border-slate-700">
            <Search className="text-[#3F72AF] dark:text-[#DBE2EF]" size={18} />
          </div>

          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-transparent outline-none text-sm text-[#112D4E] dark:text-[#DBE2EF] placeholder:text-[#3F72AF]/80 dark:placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          <SlidersHorizontal size={16} className="text-[#3F72AF]" />
          Filters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
          >
            <option value="">Status (All)</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow-up">Follow-up</option>
            <option value="not-interested">Not Interested</option>
            <option value="converted">Converted</option>
          </select>

          <select
            value={filterSource}
            onChange={(e) => {
              setFilterSource(e.target.value);
              setPage(1);
            }}
            className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
          >
            <option value="">Source (All)</option>
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
            className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
          >
            <option value="">Course (All)</option>
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
            className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
          >
            <option value="">Created (All)</option>
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
                className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => {
                  setCustomTo(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm border border-[#DBE2EF] dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
              />
            </>
          ) : (
            <div className="xl:col-span-2" />
          )}
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* CHIPS */}
          <div className="flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearSingleFilter(chip.key)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 text-xs text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
              >
                <span>{chip.label}</span>
                <span className="opacity-70">✕</span>
              </button>
            ))}
          </div>

          <button
            disabled={tableLoading}
            onClick={clearAllFilters}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
            <div className="px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-[#DBE2EF] dark:border-slate-700 text-sm shadow-lg">
              Loading...
            </div>
          </div>
        )}

        {visitors.length === 0 ? (
          <div className="rounded-3xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl p-12 text-center text-[#3F72AF] dark:text-[#DBE2EF] shadow-sm">
            No visitors found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-white/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl shadow-sm">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#DBE2EF]/80 dark:bg-slate-800/80 backdrop-blur border-b border-white/40 dark:border-slate-700">
                <tr>
                  <th className="p-4 text-left whitespace-nowrap">
                    <SortableHeader label="Name" field="name" />
                  </th>
                  <th className="p-4 text-left whitespace-nowrap">
                    <SortableHeader label="Email" field="email" />
                  </th>
                  <th className="p-4 text-left whitespace-nowrap">Phone</th>
                  <th className="p-4 text-left whitespace-nowrap">Course</th>
                  <th className="p-4 text-left whitespace-nowrap">Source</th>
                  <th className="p-4 text-left whitespace-nowrap">Status</th>

                  {activeTab === "not-interested" && (
                    <th className="p-4 text-left whitespace-nowrap">Reason</th>
                  )}

                  {activeTab === "follow-up" && (
                    <th className="p-4 text-left whitespace-nowrap">
                      Follow-up Date
                    </th>
                  )}

                  {activeTab === "converted" && (
                    <th className="p-4 text-left whitespace-nowrap">
                      Converted To
                    </th>
                  )}

                  <th className="p-4 text-left whitespace-nowrap">
                    <SortableHeader label="Created" field="createdAt" />
                  </th>

                  <th className="p-4 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DBE2EF]/60 dark:divide-slate-700">
                {visitors.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-[#DBE2EF]/40 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-4 font-semibold text-[#112D4E] dark:text-[#DBE2EF] whitespace-nowrap">
                      {v.name}
                    </td>

                    <td className="p-4 text-[#3F72AF] dark:text-slate-300">
                      {v.email || "—"}
                    </td>

                    <td className="p-4 text-[#3F72AF] dark:text-slate-300 whitespace-nowrap">
                      {v.phone || "—"}
                    </td>

                    <td className="p-4 text-[#112D4E] dark:text-[#DBE2EF]">
                      {v.course?.title || "—"}
                    </td>

                    <td className="p-4 text-[#3F72AF] dark:text-slate-300 capitalize whitespace-nowrap">
                      {v.source || "—"}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold border ${statusPill(
                          v.status,
                        )}`}
                      >
                        {v.status || "new"}
                      </span>
                    </td>

                    {activeTab === "not-interested" && (
                      <td className="p-4 text-xs text-[#3F72AF] dark:text-slate-300 max-w-[260px]">
                        <div className="line-clamp-2">
                          {v.notInterestedReason || "—"}
                        </div>
                      </td>
                    )}

                    {activeTab === "follow-up" && (
                      <td className="p-4 text-[#112D4E] dark:text-[#DBE2EF] whitespace-nowrap">
                        {v.followUpDate
                          ? new Date(v.followUpDate).toLocaleDateString()
                          : "—"}
                      </td>
                    )}

                    {activeTab === "converted" && (
                      <td className="p-4 text-[#112D4E] dark:text-[#DBE2EF] whitespace-nowrap">
                        {v.conversionType || "—"}
                      </td>
                    )}

                    <td className="p-4 text-[#112D4E] dark:text-[#DBE2EF] whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-xs font-semibold"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleView(v)}
                            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                            title="View"
                          >
                            <Eye size={16} className="text-[#3F72AF]" />
                          </button>

                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                            title="Edit"
                          >
                            <Edit size={16} className="text-blue-600" />
                          </button>

                          {activeTab === "active" && (
                            <>
                              <button
                                onClick={() => handleConvertClick(v)}
                                className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                                title="Convert"
                              >
                                <UserPlus
                                  size={16}
                                  className="text-emerald-600"
                                />
                              </button>

                              <button
                                onClick={() => handleNotInterestedClick(v)}
                                className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                                title="Not Interested"
                              >
                                <XCircle
                                  size={16}
                                  className="text-orange-600"
                                />
                              </button>

                              <button
                                onClick={() => handleDeleteClick(v)}
                                className="p-2 rounded-xl border border-[#DBE2EF] dark:border-slate-700 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-600" />
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
