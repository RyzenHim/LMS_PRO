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
  const [filterCourse, setFilterCourse] = useState(""); // MUST be courseId

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
        className={`flex items-center gap-2 select-none transition-opacity ${
          tableLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        } ${
          active
            ? "font-semibold text-[#112D4E] dark:text-white"
            : "text-[#112D4E] dark:text-[#DBE2EF]"
        }`}
      >
        <span>{label}</span>
        <span className="text-xs opacity-80">{arrow}</span>
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

  // initial load
  useEffect(() => {
    fetchVisitors({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch
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
      {/* HEADER */}
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
            className="flex items-center gap-2 bg-[#3F72AF] text-white px-4 py-2 rounded-lg hover:bg-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Visitor
          </button>
        )}
      </div>

      {/* TABS */}
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
                ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF]"
                : "text-[#3F72AF]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH */}
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

      {/* FILTERS */}
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

        {/* SOURCE (KEEP SAME AS BACKEND ENUM) */}
        <select
          value={filterSource}
          onChange={(e) => {
            setFilterSource(e.target.value);
            setPage(1);
          }}
          className="text-sm border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="">Source (All)</option>
          <option value="call">Call</option>
          <option value="walk-in">Walk-in</option>
          <option value="email">Email</option>
          <option value="referral">Referral</option>
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
            <option key={c._id} value={c._id}>
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
            >
              {chip.label} ✕
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {/* TABLE */}
      <div className="relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
            <div className="px-4 py-2 rounded-lg bg-white dark:bg-[#112D4E] border border-[#DBE2EF] dark:border-[#3F72AF] text-sm shadow-lg">
              Loading...
            </div>
          </div>
        )}

        {visitors.length === 0 ? (
          <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg p-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No visitors found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg shadow-lg">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
                <tr>
                  <th className="border p-3 text-left">
                    <SortableHeader label="Name" field="name" />
                  </th>
                  <th className="border p-3 text-left">
                    <SortableHeader label="Email" field="email" />
                  </th>
                  <th className="border p-3 text-left">Phone</th>
                  <th className="border p-3 text-left">Course</th>
                  <th className="border p-3 text-left">Source</th>
                  <th className="border p-3 text-left">Status</th>

                  {activeTab === "not-interested" && (
                    <th className="border p-3 text-left">Reason</th>
                  )}

                  {activeTab === "follow-up" && (
                    <th className="border p-3 text-left">Follow-up Date</th>
                  )}

                  {activeTab === "converted" && (
                    <th className="border p-3 text-left">Converted To</th>
                  )}

                  <th className="border p-3 text-left">
                    <SortableHeader label="Created" field="createdAt" />
                  </th>

                  <th className="border p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visitors.map((v) => (
                  <tr
                    key={v._id}
                    className="hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
                  >
                    <td className="border p-3 font-medium">{v.name}</td>
                    <td className="border p-3">{v.email || "—"}</td>
                    <td className="border p-3">{v.phone || "—"}</td>

                    {/* IMPORTANT: course is populated */}
                    <td className="border p-3">{v.course?.title || "—"}</td>

                    <td className="border p-3 capitalize">{v.source || "—"}</td>

                    <td className="border p-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 capitalize">
                        {v.status || "new"}
                      </span>
                    </td>

                    {activeTab === "not-interested" && (
                      <td className="border p-3 text-xs">
                        {v.notInterestedReason || "—"}
                      </td>
                    )}

                    {activeTab === "follow-up" && (
                      <td className="border p-3">
                        {v.followUpDate
                          ? new Date(v.followUpDate).toLocaleDateString()
                          : "—"}
                      </td>
                    )}

                    {activeTab === "converted" && (
                      <td className="border p-3">{v.conversionType || "—"}</td>
                    )}

                    <td className="border p-3">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </td>

                    <td className="border p-3 space-x-2">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(v._id)}
                          className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1"
                        >
                          <RotateCcw size={16} />
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleView(v)}
                            className="text-[#3F72AF] hover:text-[#112D4E]"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => {
                              setEditVisitor(v);
                              setOpenEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          {activeTab === "active" && (
                            <>
                              <button
                                onClick={() => handleConvertClick(v)}
                                className="text-green-600 hover:text-green-700"
                                title="Convert"
                              >
                                <UserPlus size={16} className="inline" />
                              </button>

                              <button
                                onClick={() => handleNotInterestedClick(v)}
                                className="text-orange-600 hover:text-orange-700"
                                title="Not Interested"
                              >
                                <XCircle size={16} className="inline" />
                              </button>

                              <button
                                onClick={() => handleDeleteClick(v)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 size={16} className="inline" />
                              </button>
                            </>
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
