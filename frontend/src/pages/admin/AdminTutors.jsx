import React, { useEffect, useMemo, useState } from "react";
import { Search, Eye, Edit, Trash2, RotateCcw } from "lucide-react";

import { tutorService } from "../../services/tutorService";
import { employeeService } from "../../services/employeeService"; // ✅ NEW

import EditTutorModal from "./modal/EditTutorModal";
import ViewTutorModal from "./modal/ViewTutorModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

import Pagination from "../../components/Pagination";

const AdminTutors = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [tutors, setTutors] = useState([]);
  const [deletedTutors, setDeletedTutors] = useState([]);

  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);

  const [totalActive, setTotalActive] = useState(0);
  const [totalTrash, setTotalTrash] = useState(0);

  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState("desc");

  const [filters, setFilters] = useState({});
  const [filterField, setFilterField] = useState("expertise");
  const [filterValue, setFilterValue] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedTutor, setSelectedTutor] = useState(null);

  // =========================
  // FILTERS
  // =========================
  const addFilter = () => {
    if (!filterField || !filterValue) return;

    const value =
      filterField === "isActive" ? String(filterValue) : filterValue.trim();

    setFilters((prev) => ({
      ...prev,
      [filterField]: value,
    }));

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

  // =========================
  // API CALLS
  // =========================
  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await tutorService.getAll({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setTutors(res.data.tutors || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalActive(res.data.totalTutors || 0);
    } catch (error) {
      console.error("Error fetching tutors", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedTutors = async () => {
    setLoading(true);
    try {
      const res = await tutorService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setDeletedTutors(res.data.tutors || []);
      setTrashTotalPages(res.data.totalPages || 1);
      setTotalTrash(res.data.totalTutors || 0);
    } catch (error) {
      console.error("Error fetching deleted tutors", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ON CHANGE
  // =========================
  useEffect(() => {
    if (activeTab === "active") fetchTutors();
    else fetchDeletedTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    page,
    trashPage,
    search,
    sortBy,
    sortOrder,
    JSON.stringify(filters),
  ]);

  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

  // =========================
  // CRUD
  // =========================
  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    setOpenEdit(true);
  };

  // ✅ FIXED: Update both tutor + employee
  const handleUpdateTutor = async (data) => {
    try {
      if (!selectedTutor?._id) return;

      const tutorId = selectedTutor._id;
      const employeeId = selectedTutor?.employee?._id;

      // data = { employee: {...}, tutor: {...} }
      const tutorPayload = data?.tutor || {};
      const employeePayload = data?.employee || {};

      // 1) Update tutor model
      await tutorService.update(tutorId, tutorPayload);

      // 2) Update employee model (only if employee exists)
      if (employeeId) {
        await employeeService.update(employeeId, employeePayload);
      }

      // refresh list
      if (activeTab === "active") await fetchTutors();
      else await fetchDeletedTutors();

      setOpenEdit(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update tutor");
    }
  };

  const handleView = (tutor) => {
    setSelectedTutor(tutor);
    setOpenView(true);
  };

  const handleDeleteClick = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await tutorService.softDelete(selectedTutor._id);

      await fetchTutors();
      await fetchDeletedTutors();

      setOpenDelete(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete tutor");
    }
  };

  const handleRestore = async (id) => {
    try {
      await tutorService.restore(id);

      await fetchTutors();
      await fetchDeletedTutors();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore tutor");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await tutorService.toggleStatus(id);
      await fetchTutors();
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredTutors = activeTab === "active" ? tutors : deletedTutors;

  const activeCount = useMemo(() => totalActive, [totalActive]);
  const trashCount = useMemo(() => totalTrash, [totalTrash]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Tutors
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage instructors & tutors (created via Employees)
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
          Active ({activeCount})
        </button>

        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({trashCount})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search tutors by name, email, expertise..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
            setTrashPage(1);
          }}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] px-2 py-2 rounded-md"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="text-sm border rounded-lg px-2 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="expertise">Expertise</option>
          <option value="qualification">Qualification</option>
          <option value="isActive">Is Active</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
        </select>

        {filterField === "isActive" ? (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="text-sm border rounded-lg px-2 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
          >
            <option value="">Select</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        ) : (
          <input
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Filter value"
            className="text-sm border rounded-lg px-2 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
          />
        )}

        <button
          onClick={addFilter}
          className="px-3 py-2 rounded-lg bg-[#3F72AF] text-white text-sm"
        >
          Add Filter
        </button>

        <button
          onClick={clearFilters}
          className="px-3 py-2 rounded-lg border text-sm dark:border-[#3F72AF] dark:text-[#DBE2EF]"
        >
          Clear Filters
        </button>

        <div className="flex flex-wrap gap-2">
          {Object.keys(filters).map((key) => (
            <button
              key={key}
              onClick={() => removeFilter(key)}
              className="px-2 py-1 text-xs rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              {key}: {String(filters[key])} ×
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading tutors...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Name
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Email
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Phone
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Expertise
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Experience
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Qualification
                  </th>

                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Salary
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
                {filteredTutors.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                      {t.employee?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {t.employee?.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {t.employee?.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {t.expertise || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {t.experience || 0} years
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {t.qualification || "—"}
                    </td>

                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      ₹{t.employee?.salary || 0}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          t.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {t.isActive ? "Yes" : "No"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(t)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF]"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleEdit(t)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(t._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {t.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(t)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(t._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 text-sm flex items-center gap-1"
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

        {!loading && filteredTutors.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No tutors found
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={activeTab === "active" ? page : trashPage}
        totalPages={activeTab === "active" ? totalPages : trashTotalPages}
        onPageChange={(p) =>
          activeTab === "active" ? setPage(p) : setTrashPage(p)
        }
      />

      {/* Modals */}
      <EditTutorModal
        open={openEdit}
        tutor={selectedTutor}
        onClose={() => {
          setOpenEdit(false);
          setSelectedTutor(null);
        }}
        onSubmit={handleUpdateTutor}
      />

      <ViewTutorModal
        open={openView}
        tutor={selectedTutor}
        onClose={() => {
          setOpenView(false);
          setSelectedTutor(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedTutor(null);
        }}
        onConfirm={handleDelete}
        title={selectedTutor?.employee?.name || "Tutor"}
      />
    </div>
  );
};

export default AdminTutors;
