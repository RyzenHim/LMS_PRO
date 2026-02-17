import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Repeat,
  Filter,
  X,
  RefreshCcw,
} from "lucide-react";

import { studentService } from "../../services/studentService";

import EditStudentModal from "./modal/EditStudentModal";
import ViewStudentModal from "./modal/ViewStudentModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import ChangeBatchModal from "./modal/ChangeBatchModal";

import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const AdminStudents = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);

  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [filters, setFilters] = useState({});
  const [filterField, setFilterField] = useState("status");
  const [filterValue, setFilterValue] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openChangeBatch, setOpenChangeBatch] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  // ===============================
  // SORT
  // ===============================
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
    setTrashPage(1);
  };

  // ===============================
  // FILTERS
  // ===============================
  const addFilter = () => {
    if (!filterField || !filterValue) return;
    setFilters((prev) => ({ ...prev, [filterField]: filterValue }));
    setFilterValue("");
    setPage(1);
    setTrashPage(1);
  };

  const removeFilter = (field) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setPage(1);
    setTrashPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    setTrashPage(1);
  };

  // ===============================
  // API
  // ===============================
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      // ✅ FIX: service might already return res.data
      const list = res?.students || res?.data?.students || [];
      const pages = res?.totalPages || res?.data?.totalPages || 1;

      setStudents(Array.isArray(list) ? list : []);
      setTotalPages(pages);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      const list = res?.students || res?.data?.students || [];
      const pages = res?.totalPages || res?.data?.totalPages || 1;

      setDeletedStudents(Array.isArray(list) ? list : []);
      setTrashTotalPages(pages);
    } catch (error) {
      console.error("Error fetching deleted students", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch based on tab
  useEffect(() => {
    if (activeTab === "active") fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, search, sortBy, sortOrder, JSON.stringify(filters)]);

  useEffect(() => {
    if (activeTab === "trash") fetchDeletedStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    trashPage,
    search,
    sortBy,
    sortOrder,
    JSON.stringify(filters),
  ]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

  // ===============================
  // CRUD
  // ===============================
  const handleEdit = (student) => {
    setSelectedStudent(student);
    setOpenEdit(true);
  };

  const handleUpdateStudent = async (data) => {
    try {
      await studentService.update(selectedStudent._id, data);
      await fetchStudents();

      setOpenEdit(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update student");
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setOpenView(true);
  };

  const handleChangeBatch = (student) => {
    setSelectedStudent(student);
    setOpenChangeBatch(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await studentService.softDelete(selectedStudent._id);

      await fetchStudents();
      await fetchDeletedStudents();

      setOpenDelete(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  const handleRestore = async (id) => {
    try {
      await studentService.restore(id);

      await fetchStudents();
      await fetchDeletedStudents();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore student");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await studentService.toggleStatus(id);
      await fetchStudents();
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredStudents = activeTab === "active" ? students : deletedStudents;

  const hasFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);

  // ===============================
  // UI Helpers
  // ===============================
  const IconBtn = ({ title, onClick, children, className = "" }) => (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] p-2 text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF]/30 transition ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Students
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage enrolled students and their batches
          </p>
        </div>

        <button
          onClick={() =>
            activeTab === "active" ? fetchStudents() : fetchDeletedStudents()
          }
          className="inline-flex items-center gap-2 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] px-4 py-2 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF]/30 transition"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] p-2 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "active"
              ? "bg-[#3F72AF] text-white"
              : "text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
          }`}
        >
          Active
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "trash"
              ? "bg-red-600 text-white"
              : "text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a]"
          }`}
        >
          Trash
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3F72AF] dark:text-[#DBE2EF]"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              setTrashPage(1);
            }}
            className="w-full rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] px-11 py-2.5 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40"
          />
        </div>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
          <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Filters
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            className="rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] px-3 py-2 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none"
          >
            <option value="status">Status</option>
            <option value="isActive">Is Active</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="adhaar">Adhaar</option>
          </select>

          <input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Enter value"
            className="flex-1 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] px-3 py-2 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none"
          />

          <button
            onClick={addFilter}
            className="rounded-xl bg-[#3F72AF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#112D4E] transition"
          >
            Add
          </button>

          <button
            onClick={clearFilters}
            className="rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] px-4 py-2 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition"
          >
            Clear
          </button>
        </div>

        {/* Active filter pills */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(filters).map((key) => (
              <button
                key={key}
                onClick={() => removeFilter(key)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#DBE2EF] dark:bg-[#0a1f3a] px-3 py-1.5 text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF]"
                title="Remove filter"
              >
                {key}: {String(filters[key])}
                <X size={14} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-2xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
              <tr>
                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  <SortHeader
                    label="Name"
                    field="name"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  <SortHeader
                    label="Email"
                    field="email"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Phone
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Course
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  <SortHeader
                    label="Status"
                    field="status"
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                  />
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Enrollment Date
                </th>

                <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                  Is Active
                </th>

                <th className="px-6 py-3 text-right text-[#112D4E] dark:text-[#DBE2EF]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]"
                  >
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-[#3F72AF] dark:text-[#DBE2EF]"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t border-[#DBE2EF] dark:border-[#3F72AF] hover:bg-[#DBE2EF]/60 dark:hover:bg-[#0a1f3a] transition"
                  >
                    <td className="px-6 py-4 font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                      {s.visitor?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.visitor?.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.visitor?.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.visitor?.course?.title || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 text-xs rounded-xl font-semibold capitalize ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : s.status === "suspended"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-600/40 dark:text-gray-200"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.enrollmentDate
                        ? new Date(s.enrollmentDate).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 text-xs rounded-xl font-semibold ${
                          s.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }`}
                      >
                        {s.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <IconBtn title="View" onClick={() => handleView(s)}>
                              <Eye size={16} />
                            </IconBtn>

                            <IconBtn title="Edit" onClick={() => handleEdit(s)}>
                              <Edit size={16} />
                            </IconBtn>

                            <IconBtn
                              title="Change Batch"
                              onClick={() => handleChangeBatch(s)}
                            >
                              <Repeat size={16} />
                            </IconBtn>

                            <button
                              onClick={() => handleToggleStatus(s._id)}
                              className="rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] px-3 py-2 text-xs font-semibold text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 hover:opacity-90 transition"
                              title="Toggle Active"
                            >
                              {s.isActive ? "Disable" : "Enable"}
                            </button>

                            <IconBtn
                              title="Delete"
                              onClick={() => handleDeleteClick(s)}
                              className="border-red-200 dark:border-red-500/40 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={16} />
                            </IconBtn>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(s._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition"
                            title="Restore student"
                          >
                            <RotateCcw size={16} />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination
        page={activeTab === "active" ? page : trashPage}
        totalPages={activeTab === "active" ? totalPages : trashTotalPages}
        onPageChange={(p) =>
          activeTab === "active" ? setPage(p) : setTrashPage(p)
        }
      />

      {/* ================= MODALS ================= */}
      <EditStudentModal
        open={openEdit}
        student={selectedStudent}
        onClose={() => {
          setOpenEdit(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleUpdateStudent}
      />

      <ViewStudentModal
        open={openView}
        student={selectedStudent}
        onClose={() => {
          setOpenView(false);
          setSelectedStudent(null);
        }}
      />

      <ChangeBatchModal
        open={openChangeBatch}
        student={selectedStudent}
        onClose={() => {
          setOpenChangeBatch(false);
          setSelectedStudent(null);
        }}
        onChanged={() => fetchStudents()}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDelete}
        title={selectedStudent?.visitor?.name || "Student"}
      />
    </div>
  );
};

export default AdminStudents;
