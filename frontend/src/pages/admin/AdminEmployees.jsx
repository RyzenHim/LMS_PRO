import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw } from "lucide-react";

import AddEmployeeModal from "./modal/AddEmployeeModal";
import { employeeService } from "../../services/employeeService";
import Admin_EditEmployeeModal from "./modal/employee/Admin_EditEmployeeModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import ViewEmployeeModal from "./modal/ViewEmployeeModal";

import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const AdminEmployees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [allEmp, setAllEmp] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);

  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);

  // counts
  const [totalActive, setTotalActive] = useState(0);
  const [totalTrash, setTotalTrash] = useState(0);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [filters, setFilters] = useState({});
  const [filterField, setFilterField] = useState("department");
  const [filterValue, setFilterValue] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedEmp, setSelectedEmp] = useState(null);

  // =========================
  // SORT
  // =========================
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
  // API
  // =========================
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll({
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setAllEmp(res.data.allEmployes || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalActive(res.data.totalEmployes || 0);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getDeleted({
        page: trashPage,
        limit: 10,
        search,
        sortBy,
        sortOrder,
        ...filters,
      });

      setDeletedEmployees(res.data.allEmployes || []);
      setTrashTotalPages(res.data.totalPages || 1);
      setTotalTrash(res.data.totalEmployes || 0);
    } catch (error) {
      console.error("Error fetching deleted employees", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ON CHANGE (FIXED)
  // =========================
  useEffect(() => {
    if (activeTab === "active") {
      fetchEmployees();
    } else {
      fetchDeletedEmployees();
    }
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

  // reset pages when tab changes
  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

  // =========================
  // CRUD
  // =========================
  const handleEdit = (emp) => {
    setSelectedEmp(emp);
    setOpenEdit(true);
  };

  const handleView = (emp) => {
    setSelectedEmp(emp);
    setOpenView(true);
  };

  const handleUpdateEmployee = async (data) => {
    try {
      await employeeService.update(selectedEmp._id, data);

      // refresh current tab
      if (activeTab === "active") await fetchEmployees();
      else await fetchDeletedEmployees();

      setOpenEdit(false);
      setSelectedEmp(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update employee");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await employeeService.toggleStatus(id);
      await fetchEmployees();
    } catch (error) {
      console.error("Error toggling employee status", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDeleteClick = (emp) => {
    setSelectedEmp(emp);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await employeeService.softDelete(selectedEmp._id);

      await fetchEmployees();
      await fetchDeletedEmployees();

      setOpenDelete(false);
      setSelectedEmp(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const handleRestore = async (id) => {
    try {
      await employeeService.restore(id);

      await fetchEmployees();
      await fetchDeletedEmployees();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore employee");
    }
  };

  const handleAddEmployee = async (data) => {
    try {
      const empData = {
        name: data.name?.trim(),
        email: data.email?.trim() || "", // ✅ safe
        phone: data.phone?.trim() || "",
        department: data.department?.trim(),
        designation: data.designation,
        salary: Number(data.salary || 0),
      };

      await employeeService.create(empData);

      await fetchEmployees();

      setOpenAdd(false);
    } catch (error) {
      console.error("Add employee failed", error);
      alert(error.response?.data?.message || "Failed to add employee");
    }
  };

  const filteredEmployees = activeTab === "active" ? allEmp : deletedEmployees;

  const activeCount = useMemo(() => totalActive, [totalActive]);
  const trashCount = useMemo(() => totalTrash, [totalTrash]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Employees
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage admin, HR, and teachers
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}
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
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-[#3F72AF] dark:text-[#DBE2EF]" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, department, designation..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              setTrashPage(1);
            }}
            className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] px-2 py-2 rounded-md"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="text-sm border rounded-lg px-2 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        >
          <option value="department">Department</option>
          <option value="designation">Designation</option>
          <option value="isActive">Is Active</option>
          <option value="email">Email</option>
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
          className="px-3 py-2 rounded-lg border text-sm dark:text-[#DBE2EF]"
        >
          Clear
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
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <tr>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Name"
                      field="name"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Email"
                      field="email"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Department"
                      field="department"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    <SortHeader
                      label="Designation"
                      field="designation"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Salary
                  </th>

                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[#112D4E] dark:text-[#DBE2EF]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                      {emp.name}
                    </td>

                    <td className="px-4 py-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {emp.email || "—"}
                    </td>

                    <td className="px-4 py-3 text-[#112D4E] dark:text-[#DBE2EF]">
                      {emp.department || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF] border border-[#3F72AF]">
                        {emp.designation || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#112D4E] dark:text-[#DBE2EF]">
                      ₹{Number(emp.salary || 0)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          emp.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(emp)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleEdit(emp)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(emp._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {emp.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            onClick={() => handleDeleteClick(emp)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(emp._id)}
                          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm inline-flex items-center gap-1 transition-colors"
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

        {!loading && filteredEmployees.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
            No employees found
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
      <AddEmployeeModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddEmployee}
      />

      <Admin_EditEmployeeModal
        open={openEdit}
        employee={selectedEmp}
        onClose={() => {
          setOpenEdit(false);
          setSelectedEmp(null);
        }}
        onSubmit={handleUpdateEmployee}
      />

      <ViewEmployeeModal
        open={openView}
        employee={selectedEmp}
        onClose={() => {
          setOpenView(false);
          setSelectedEmp(null);
        }}
      />

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedEmp(null);
        }}
        onConfirm={handleDelete}
        title={selectedEmp?.name || "Employee"}
      />
    </div>
  );
};

export default AdminEmployees;
