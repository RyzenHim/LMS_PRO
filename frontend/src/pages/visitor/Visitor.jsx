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
} from "lucide-react";

import AddVisitorModal from "./modal/AddVisitorModal";
import EditVisitorModal from "./modal/EditVisitorModal";
import ViewVisitorModal from "./modal/ViewVisitorModal";
import ConvertVisitorModal from "./modal/ConvertVisitorModal";
import NotInterestedModal from "./modal/NotInterestedModal";
import ConfirmDeleteModal from "../admin/modal/ConfirmDeleteModal";

import axiosInstance from "../../api/axios";
import Pagination from "../../components/Pagination";

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [notInterestedVisitors, setNotInterestedVisitors] = useState([]);
  const [followUpVisitors, setFollowUpVisitors] = useState([]);
  const [convertedVisitors, setConvertedVisitors] = useState([]);
  const [deletedVisitors, setDeletedVisitors] = useState([]);

  const [loading, setLoading] = useState(true); // full page loader
  const [tableLoading, setTableLoading] = useState(false); // smooth loader overlay

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

  // filters (real)
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // created filter
  const [createdFilter, setCreatedFilter] = useState(""); // today | yesterday | last7days | last30days | thisMonth | custom
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
  // FETCH COURSES (DROPDOWN)
  // =========================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // change this endpoint if your course route is different
        const res = await axiosInstance.get("/course/all");
        setCourses(res.data || []);
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

      // default order rules
      if (field === "createdAt") setSortOrder("desc");
      else setSortOrder("asc");
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
        className={`flex items-center gap-2 select-none transition-opacity ${
          tableLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${
          active
            ? "font-semibold text-[#112D4E] dark:text-white"
            : "text-[#112D4E] dark:text-[#DBE2EF]"
        }`}
        title={`Sort by ${label}`}
      >
        <span>{label}</span>
        <span className="text-xs opacity-80">{arrow}</span>
      </button>
    );
  };

  // =========================
  // FILTER PARAMS BUILDER
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
  // FETCH VISITORS
  // =========================
  const fetchActiveTab = async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    else setTableLoading(true);

    setError("");

    try {
      const params = buildParams();
      let res;

      if (activeTab === "active") {
        res = await axiosInstance.get("/visitor/allvisitor", { params });
        setVisitors(res.data.visitors || []);
      } else if (activeTab === "not-interested") {
        res = await axiosInstance.get("/visitor/not-interested/list", {
          params,
        });
        setNotInterestedVisitors(res.data.visitors || []);
      } else if (activeTab === "follow-up") {
        res = await axiosInstance.get("/visitor/follow-up/list", { params });
        setFollowUpVisitors(res.data.visitors || []);
      } else if (activeTab === "converted") {
        res = await axiosInstance.get("/visitor/converted/list", { params });
        setConvertedVisitors(res.data.visitors || []);
      } else if (activeTab === "trash") {
        res = await axiosInstance.get("/visitor/trash/list", { params });
        setDeletedVisitors(res.data.visitors || []);
      }

      setTotalPages(res?.data?.totalPages || 1);
    } catch (err) {
      setError("Failed to load visitors");
      console.error("Error fetching visitors:", err);
    } finally {
      if (initial) setLoading(false);
      setTableLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchActiveTab({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch on change
  useEffect(() => {
    if (loading) return;
    fetchActiveTab({ initial: false });
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
  // CURRENT TAB DATA
  // =========================
  const filteredVisitors =
    activeTab === "active"
      ? visitors
      : activeTab === "not-interested"
        ? notInterestedVisitors
        : activeTab === "follow-up"
          ? followUpVisitors
          : activeTab === "converted"
            ? convertedVisitors
            : deletedVisitors;

  // =========================
  // COUNTS
  // =========================
  const getTabCount = (tab) => {
    switch (tab) {
      case "active":
        return visitors.length;
      case "not-interested":
        return notInterestedVisitors.length;
      case "follow-up":
        return followUpVisitors.length;
      case "converted":
        return convertedVisitors.length;
      case "trash":
        return deletedVisitors.length;
      default:
        return 0;
    }
  };

  // =========================
  // FILTER CHIPS
  // =========================
  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (filterStatus)
      chips.push({ key: "status", label: `Status: ${filterStatus}` });
    if (filterSource)
      chips.push({ key: "source", label: `Source: ${filterSource}` });
    if (filterCourse)
      chips.push({ key: "course", label: `Course: ${filterCourse}` });

    if (createdFilter) {
      if (createdFilter === "custom") {
        chips.push({
          key: "created",
          label: `Created: ${customFrom || "?"} → ${customTo || "?"}`,
        });
      } else {
        chips.push({
          key: "created",
          label: `Created: ${createdFilter}`,
        });
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
      await axiosInstance.delete(`/visitor/${deleteVisitor._id}`);
      await fetchActiveTab({ initial: false });

      setOpenDeleteModal(false);
      setDeleteVisitor(null);
    } catch {
      alert("Failed to delete visitor");
      setTableLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setTableLoading(true);
      await axiosInstance.patch(`/visitor/${id}/restore`);
      await fetchActiveTab({ initial: false });
    } catch {
      alert("Failed to recover visitor");
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
    await fetchActiveTab({ initial: false });
    setOpenConvertModal(false);
    setConvertVisitor(null);
  };

  const handleNotInterestedClick = (visitor) => {
    setNotInterestedVisitor(visitor);
    setOpenNotInterestedModal(true);
  };

  const handleNotInterestedSuccess = async () => {
    await fetchActiveTab({ initial: false });
    setOpenNotInterestedModal(false);
    setNotInterestedVisitor(null);
  };

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading visitors...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Visitors
          </h1>
          <p className="text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            Manage visitor leads and conversions
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-[#3F72AF] text-white px-4 py-2 rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Visitor
          </button>
        )}
      </div>

      {/* ---------- TABS ---------- */}
      <div className="flex gap-4 border-b border-[#DBE2EF] dark:border-[#3F72AF] overflow-x-auto">
        {[
          { key: "active", label: "Active" },
          {
            key: "not-interested",
            label: "Not Interested",
            icon: <XCircle size={16} className="inline mr-1" />,
          },
          {
            key: "follow-up",
            label: "Follow-up",
            icon: <Clock size={16} className="inline mr-1" />,
          },
          {
            key: "converted",
            label: "Converted",
            icon: <CheckCircle size={16} className="inline mr-1" />,
          },
          { key: "trash", label: "Trash" },
        ].map((t) => (
          <button
            key={t.key}
            disabled={tableLoading}
            onClick={() => {
              setActiveTab(t.key);
              setPage(1);
            }}
            className={`pb-2 px-2 whitespace-nowrap transition-colors ${
              tableLoading ? "opacity-60 cursor-not-allowed" : ""
            } ${
              activeTab === t.key
                ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
                : "text-[#3F72AF] dark:text-[#DBE2EF]"
            }`}
          >
            {t.icon}
            {t.label} ({getTabCount(t.key)})
          </button>
        ))}
      </div>

      {/* ---------- SEARCH ---------- */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-[#3F72AF] dark:text-[#DBE2EF]" size={18} />
          <input
            type="text"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
          />
        </div>
      </div>

      {/* ---------- FILTERS (DROPDOWNS) ---------- */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        {/* STATUS */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">Status (All)</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="follow-up">Follow-up</option>
          <option value="not-interested">Not Interested</option>
          <option value="converted">Converted</option>
        </select>

        {/* SOURCE */}
        <select
          value={filterSource}
          onChange={(e) => {
            setFilterSource(e.target.value);
            setPage(1);
          }}
          className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">Source (All)</option>
          <option value="walkin">Walkin</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="linkedin">LinkedIn</option>
          <option value="referral">Referral</option>
          <option value="website">Website</option>
          <option value="other">Other</option>
        </select>

        {/* COURSE */}
        <select
          value={filterCourse}
          onChange={(e) => {
            setFilterCourse(e.target.value);
            setPage(1);
          }}
          className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">Course (All)</option>
          {courses.map((c) => (
            <option key={c._id} value={c.title}>
              {c.title}
            </option>
          ))}
        </select>

        {/* CREATED */}
        <select
          value={createdFilter}
          onChange={(e) => {
            setCreatedFilter(e.target.value);
            setCustomFrom("");
            setCustomTo("");
            setPage(1);
          }}
          className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">Created (All)</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {/* CUSTOM RANGE */}
        {createdFilter === "custom" && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setPage(1);
              }}
              className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setPage(1);
              }}
              className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </>
        )}

        {/* CLEAR ALL */}
        <button
          disabled={tableLoading}
          onClick={clearAllFilters}
          className="px-3 py-2 rounded-lg border text-sm dark:border-[#3F72AF]"
        >
          Clear All
        </button>
      </div>

      {/* FILTER CHIPS */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => clearSingleFilter(chip.key)}
              className="px-3 py-1 text-xs rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"
              title="Remove filter"
            >
              {chip.label} ✕
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {/* ---------- TABLE ---------- */}
      <div className="relative">
        {/* Overlay Loader */}
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-[#112D4E] border border-[#DBE2EF] dark:border-[#3F72AF] text-sm text-[#112D4E] dark:text-[#DBE2EF] shadow-lg">
              Loading...
            </div>
          </div>
        )}

        {filteredVisitors.length === 0 ? (
          <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No visitors found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
                <tr>
                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left">
                    <SortableHeader label="Name" field="name" />
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left">
                    <SortableHeader label="Email" field="email" />
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Phone
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Course
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Source
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Status
                  </th>

                  {activeTab === "not-interested" && (
                    <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                      Reason
                    </th>
                  )}

                  {activeTab === "follow-up" && (
                    <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                      Follow-up Date
                    </th>
                  )}

                  {activeTab === "converted" && (
                    <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                      Converted To
                    </th>
                  )}

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left">
                    <SortableHeader label="Created" field="createdAt" />
                  </th>

                  <th className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredVisitors.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#112D4E] dark:text-[#DBE2EF] font-medium">
                      {v.name}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {v.email || "—"}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {v.phone || "—"}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {v.course || "—"}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 capitalize text-[#3F72AF] dark:text-[#DBE2EF]">
                      {v.source || "—"}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-md capitalize ${
                          v.status === "converted"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : v.status === "contacted"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : v.status === "not-interested"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : v.status === "follow-up"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {v.status || "new"}
                      </span>
                    </td>

                    {activeTab === "not-interested" && (
                      <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF] text-xs">
                        {v.notInterestedReason || "—"}
                      </td>
                    )}

                    {activeTab === "follow-up" && (
                      <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                        {v.followUpDate
                          ? new Date(v.followUpDate).toLocaleDateString()
                          : "—"}
                      </td>
                    )}

                    {activeTab === "converted" && (
                      <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3">
                        <span className="px-2 py-1 text-xs rounded-md bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                          {v.conversionType || "—"}
                        </span>
                      </td>
                    )}

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="border border-[#DBE2EF] dark:border-[#3F72AF] p-3 space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(v)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleConvertClick(v)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm transition-colors"
                            title="Convert"
                          >
                            <UserPlus size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleNotInterestedClick(v)}
                            className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm transition-colors"
                            title="Not Interested"
                          >
                            <XCircle size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(v)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center gap-1 transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleView(v)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          {activeTab === "not-interested" && (
                            <button
                              onClick={() => handleConvertClick(v)}
                              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm transition-colors"
                              title="Convert"
                            >
                              <UserPlus size={16} className="inline" />
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- PAGINATION ---------- */}
      <div className={tableLoading ? "opacity-60 pointer-events-none" : ""}>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* ---------- MODALS ---------- */}
      <AddVisitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          fetchActiveTab({ initial: false });
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
          fetchActiveTab({ initial: false });
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
