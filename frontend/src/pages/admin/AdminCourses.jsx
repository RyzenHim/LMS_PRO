import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  BookOpen,
  Filter,
  X,
} from "lucide-react";

import { courseService } from "../../services/courseService";
import AddCourseModal from "./modal/AddCourseModal";
import EditCourseModal from "./modal/EditCourseModal";
import ViewCourseModal from "./modal/ViewCourseModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";

// ── Status pill styles ─────────────────────────────────────
const STATUS_STYLES = {
  published:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  archived:
    "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  draft:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

// ── Level pill styles ──────────────────────────────────────
const LEVEL_STYLES = {
  beginner: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  intermediate:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ── Sort arrow helper ──────────────────────────────────────
const SortArrow = ({ field, sortBy, sortOrder }) => {
  if (sortBy !== field)
    return <span className="ml-1 opacity-30 text-xs">↕</span>;
  return (
    <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
  );
};

// ── Shared input style ─────────────────────────────────────
const selectCls =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

const inputCls =
  "w-full text-sm px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition";

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
const AdminCourses = () => {
  // ── Data ──────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  // ── Tab ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("active");

  // ── Search ────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Sort ──────────────────────────────────────────────
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // ── Filters ───────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState(""); // draft | published | archived
  const [filterLevel, setFilterLevel] = useState(""); // beginner | intermediate | advanced
  const [filterCategory, setFilterCategory] = useState(""); // text
  const [filterIsActive, setFilterIsActive] = useState(""); // true | false
  const [showFilters, setShowFilters] = useState(false);

  // ── Pagination ────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Modals ────────────────────────────────────────────
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // ─────────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────────
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
      };

      // Active tab filters
      if (activeTab === "active") {
        if (filterStatus) params.status = filterStatus;
        if (filterLevel) params.level = filterLevel;
        if (filterCategory) params.category = filterCategory;
        if (filterIsActive) params.isActive = filterIsActive;
      }

      // Trash tab filters (backend supports category + level)
      if (activeTab === "trash") {
        if (filterCategory) params.category = filterCategory;
        if (filterLevel) params.level = filterLevel;
      }

      const fn =
        activeTab === "active"
          ? courseService.getAll
          : courseService.getDeleted;
      const res = await fn(params);

      const data = res?.data ?? res;
      setCourses(data?.courses ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalCourses(data?.totalCourses ?? 0);
    } catch (error) {
      console.error("Fetch courses error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever any dependency changes
  useEffect(() => {
    fetchCourses();
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterStatus,
    filterLevel,
    filterCategory,
    filterIsActive,
  ]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ─────────────────────────────────────────────────────
  // SORT
  // ─────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // ─────────────────────────────────────────────────────
  // CLEAR FILTERS
  // ─────────────────────────────────────────────────────
  const clearFilters = () => {
    setFilterStatus("");
    setFilterLevel("");
    setFilterCategory("");
    setFilterIsActive("");
    setPage(1);
  };

  const activeFilterCount = [
    filterStatus,
    filterLevel,
    filterCategory,
    filterIsActive,
  ].filter(Boolean).length;

  // ─────────────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────────────
  const handleAddCourse = async (data) => {
    try {
      await courseService.create(data);
      setOpenAdd(false);
      fetchCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add course");
    }
  };

  const handleUpdateCourse = async (data) => {
    try {
      await courseService.update(selectedCourse._id, data);
      setOpenEdit(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update course");
    }
  };

  const handleDelete = async () => {
    try {
      await courseService.softDelete(selectedCourse._id);
      setOpenDelete(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete course");
    }
  };

  const handleRestore = async (id) => {
    try {
      await courseService.restore(id);
      fetchCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to restore course");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await courseService.toggleStatus(id);
      fetchCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to toggle status");
    }
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────
  return (
    <div className="lms-page-enter space-y-5 p-1">
      {/* ── Header card (matches screenshot layout) ── */}
      <div className="neu-panel rounded-[30px] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 shrink-0">
              <BookOpen size={20} className="text-[#3F72AF]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#112D4E] dark:text-slate-100">
                Courses
              </h1>
              <p className="text-xs text-[#3F72AF] dark:text-slate-400 mt-0.5">
                Manage all LMS courses
                {totalCourses > 0 && (
                  <span className="ml-2 font-semibold">
                    · {totalCourses} total
                  </span>
                )}
              </p>
            </div>
          </div>

          {activeTab === "active" && (
            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold transition shadow-sm shrink-0"
            >
              <Plus size={16} />
              Add Course
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-[#DBE2EF] dark:border-slate-800 pb-0">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "active"
                ? "border-[#3F72AF] text-[#3F72AF] dark:text-slate-100 dark:border-slate-100"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#3F72AF] dark:hover:text-slate-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "trash"
                ? "border-red-500 text-red-500 dark:text-red-400 dark:border-red-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
            }`}
          >
            Trash
          </button>
        </div>
      </div>

      {/* ── Search + Filters (matches screenshot: full-width search + Filters button) ── */}
      <div className="neu-panel rounded-[30px] p-4 space-y-3">
        <div className="flex gap-3">
          {/* Search input */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-[#3F72AF]/30 transition">
            <Search
              size={15}
              className="text-[#3F72AF] dark:text-slate-500 shrink-0"
            />
            <input
              type="text"
              placeholder="Search by title, category, level, status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent outline-none text-sm text-[#112D4E] dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters toggle button */}
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
              showFilters || activeFilterCount > 0
                ? "bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 border-[#3F72AF]/30 text-[#3F72AF] dark:text-blue-400"
                : "bg-white dark:bg-[#1a1a1a] border-[#DBE2EF] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#F9F7F7] dark:hover:bg-[#252525]"
            }`}
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#3F72AF] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-[#DBE2EF] dark:border-slate-800 pt-3 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Status — active tab only */}
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}

              {/* Level */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => {
                    setFilterLevel(e.target.value);
                    setPage(1);
                  }}
                  className={selectCls}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Programming"
                  className={inputCls}
                />
              </div>

              {/* isActive — active tab only */}
              {activeTab === "active" && (
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                    Is Active
                  </label>
                  <select
                    value={filterIsActive}
                    onChange={(e) => {
                      setFilterIsActive(e.target.value);
                      setPage(1);
                    }}
                    className={selectCls}
                  >
                    <option value="">All</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 dark:text-red-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="neu-panel overflow-hidden rounded-[30px]">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No courses found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Table head */}
              <thead className="bg-[#DBE2EF]/50 dark:bg-[#1a1a1a] border-b border-[#DBE2EF] dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("title")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Course{" "}
                      <SortArrow
                        field="title"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Price{" "}
                      <SortArrow
                        field="price"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Level
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Skills
                  </th>
                  <th className="px-5 py-3.5 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300"
                    >
                      Status{" "}
                      <SortArrow
                        field="status"
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                      />
                    </button>
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Active
                  </th>
                  {activeTab === "trash" && (
                    <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                      Deleted On
                    </th>
                  )}
                  <th className="px-5 py-3.5 text-left font-semibold text-xs uppercase tracking-wider text-[#112D4E] dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-[#DBE2EF] dark:divide-slate-800">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-[#F9F7F7] dark:hover:bg-[#1a1a1a] transition-colors group"
                  >
                    {/* Course title */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 flex items-center justify-center shrink-0">
                          <BookOpen size={14} className="text-[#3F72AF]" />
                        </div>
                        <span className="font-semibold text-[#112D4E] dark:text-slate-100 line-clamp-1">
                          {course.title}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300 capitalize">
                      {course.category}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                      ₹{course.price?.toLocaleString() || 0}
                    </td>

                    {/* Level */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${LEVEL_STYLES[course.level] || LEVEL_STYLES.beginner}`}
                      >
                        {course.level}
                      </span>
                    </td>

                    {/* Skills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {course.skills && course.skills.length > 0 ? (
                          <>
                            {course.skills.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-full text-xs bg-[#DBE2EF] dark:bg-slate-700 text-[#112D4E] dark:text-slate-200 capitalize"
                              >
                                {typeof skill === "object" ? skill.name : skill}
                              </span>
                            ))}
                            {course.skills.length > 2 && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 self-center">
                                +{course.skills.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            —
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[course.status] || STATUS_STYLES.draft}`}
                      >
                        {course.status}
                      </span>
                    </td>

                    {/* isActive */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          course.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"
                        }`}
                      >
                        {course.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Deleted on — trash tab only */}
                    {activeTab === "trash" && (
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {course.deletedAt
                          ? new Date(course.deletedAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(course._id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                          {/* View */}
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setOpenView(true);
                            }}
                            className="text-[#3F72AF] dark:text-slate-300 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setOpenEdit(true);
                            }}
                            className="text-slate-500 dark:text-slate-400 hover:text-[#112D4E] dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleStatus(course._id)}
                            className={`text-xs font-medium transition ${
                              course.isActive
                                ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                : "text-green-600 dark:text-green-400 hover:text-green-700"
                            }`}
                            title={course.isActive ? "Deactivate" : "Activate"}
                          >
                            {course.isActive ? "Disable" : "Enable"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setSelectedCourse(course);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                            title="Move to Trash"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ── Modals ── */}
      <AddCourseModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddCourse}
      />

      <EditCourseModal
        open={openEdit}
        course={selectedCourse}
        onClose={() => {
          setOpenEdit(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleUpdateCourse}
      />

      <ViewCourseModal
        open={openView}
        course={selectedCourse}
        onClose={() => {
          setOpenView(false);
          setSelectedCourse(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDelete}
        title={selectedCourse?.title}
      />
    </div>
  );
};

export default AdminCourses;
