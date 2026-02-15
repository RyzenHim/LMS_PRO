import React, { useEffect, useState } from "react";
import { Search, Eye, Edit, Trash2, RotateCcw, Repeat } from "lucide-react";

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

  // ✅ SORT
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

  // ✅ FILTERS
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

      setStudents(res.data.students || []);
      // console.log("res.data.students", res.data.students);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedStudents = async () => {
    try {
      const res = await studentService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setDeletedStudents(res.data.students || []);
      setTrashTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching deleted students", error);
    }
  };

  // ✅ Fetch based on tab (optimized)
  useEffect(() => {
    if (activeTab === "active") fetchStudents();
  }, [activeTab, page, search, sortBy, sortOrder, JSON.stringify(filters)]);

  useEffect(() => {
    if (activeTab === "trash") fetchDeletedStudents();
  }, [
    activeTab,
    trashPage,
    search,
    sortBy,
    sortOrder,
    JSON.stringify(filters),
  ]);

  // ✅ Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

  // ✅ CRUD
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Students
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage enrolled students
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Active ({students.length})
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedStudents.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setTrashPage(1);
          }}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
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
          placeholder="Filter value"
          className="text-sm border rounded-lg px-2 py-1 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />

        <button
          onClick={addFilter}
          className="px-3 py-1 rounded-lg bg-[#3F72AF] text-white text-sm"
        >
          Add Filter
        </button>

        <button
          onClick={clearFilters}
          className="px-3 py-1 rounded-lg border text-sm"
        >
          Clear Filters
        </button>

        <div className="flex flex-wrap gap-2">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              onClick={() => removeFilter(key)}
              className="px-2 py-1 text-xs rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a]"
            >
              {key}: {String(filters[key])} ×
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading students...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
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
                    <SortHeader
                      label="Enrollment Date"
                      field="enrollmentDate"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
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
                {filteredStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF]">
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
                        className={`px-2 py-1 text-xs rounded-md capitalize ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : s.status === "suspended"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
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
                        className={`px-2 py-1 text-xs rounded-md ${
                          s.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {s.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(s)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleChangeBatch(s)}
                            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm transition-colors"
                            title="Change Batch"
                          >
                            <Repeat size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(s._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {s.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(s)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(s._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center gap-1 transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={16} />
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No students found
          </div>
        )}
      </div>

      <Pagination
        page={activeTab === "active" ? page : trashPage}
        totalPages={activeTab === "active" ? totalPages : trashTotalPages}
        onPageChange={(p) =>
          activeTab === "active" ? setPage(p) : setTrashPage(p)
        }
      />

      {/* Modals */}
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
