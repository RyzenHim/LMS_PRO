import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import AddEmployeeModal from "./modal/AddEmployeeModal";
import { employeeService } from "../../services/employeeService";
import Admin_EditEmployeeModal from "./modal/employee/Admin_EditEmployeeModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import ViewEmployeeModal from "./modal/ViewEmployeeModal";
import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";
import PageLoader from "../../components/ui/PageLoader";

const FILTER_OPTIONS = [
  { value: "department", label: "Department" },
  { value: "designation", label: "Designation" },
  { value: "isActive", label: "Is Active" },
  { value: "email", label: "Email" },
];

const AdminEmployees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [allEmp, setAllEmp] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [trashTotalPages, setTrashTotalPages] = useState(1);
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
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

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

  const addFilter = () => {
    if (!filterField || !filterValue) return;
    const value =
      filterField === "isActive" ? String(filterValue) : filterValue.trim();

    setFilters((prev) => ({ ...prev, [filterField]: value }));
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

  useEffect(() => {
    if (activeTab === "active") fetchEmployees();
    else fetchDeletedEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    page,
    trashPage,
    search,
    sortBy,
    sortOrder,
    filtersKey,
  ]);

  useEffect(() => {
    setPage(1);
    setTrashPage(1);
  }, [activeTab]);

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
      await employeeService.create({
        name: data.name?.trim(),
        email: data.email?.trim() || "",
        phone: data.phone?.trim() || "",
        department: data.department?.trim(),
        designation: data.designation,
        salary: Number(data.salary || 0),
      });
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
    <div className="lms-page-enter space-y-6">
      <section className="neu-panel lms-card-hover lms-sheen rounded-[34px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--lms-accent-soft)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-accent-strong)]">
              <Sparkles size={14} />
              Workforce
            </div>
            <h1 className="text-3xl font-semibold text-[var(--lms-text)]">
              Employees
            </h1>
            <p className="max-w-2xl text-sm text-[var(--lms-text-soft)]">
              Manage HR, admin, and teaching staff with a softer, more tactile
              workspace for search, filters, and review.
            </p>
          </div>

          {activeTab === "active" ? (
            <button
              onClick={() => setOpenAdd(true)}
              className="neu-button neu-button-primary rounded-[24px] px-5 py-3 text-sm font-semibold"
            >
              <Plus size={18} />
              Add Employee
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: BriefcaseBusiness, label: "Active Team", value: activeCount },
            { icon: Trash2, label: "Trash", value: trashCount },
            {
              icon: ShieldCheck,
              label: "Applied Filters",
              value: Object.keys(filters).length,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="neu-panel-soft rounded-[28px] p-4">
                <div className="flex items-center gap-3">
                  <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
                    <Icon size={18} className="text-[var(--lms-accent-strong)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--lms-text)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-4">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "active", label: `Active (${activeCount})` },
            { key: "trash", label: `Trash (${trashCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[22px] px-4 py-2.5 text-sm font-semibold ${
                activeTab === tab.key
                  ? tab.key === "trash"
                    ? "neu-button-danger"
                    : "neu-button neu-button-primary"
                  : "neu-button"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
        <div className="neu-panel rounded-[32px] p-4">
          <div className="neu-inset flex items-center gap-3 rounded-[24px] px-4 py-3">
            <Search className="text-[var(--lms-accent-strong)]/70" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, department, designation..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setTrashPage(1);
              }}
              className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
            />
          </div>
        </div>

        <div className="neu-panel rounded-[32px] p-4">
          <div className="grid gap-3 sm:grid-cols-[0.9fr,1fr,auto,auto]">
            <select
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
              className="neu-input rounded-[20px] px-4 py-3 text-sm"
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {filterField === "isActive" ? (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="neu-input rounded-[20px] px-4 py-3 text-sm"
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
                className="neu-input rounded-[20px] px-4 py-3 text-sm"
              />
            )}

            <button
              onClick={addFilter}
              className="neu-button neu-button-primary rounded-[20px] px-4 py-3 text-sm font-semibold"
            >
              Add Filter
            </button>

            <button
              onClick={clearFilters}
              className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold"
            >
              Clear
            </button>
          </div>

          {Object.keys(filters).length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.keys(filters).map((key) => (
                <button
                  key={key}
                  onClick={() => removeFilter(key)}
                  className="neu-badge rounded-full px-3 py-2 text-xs font-semibold text-[var(--lms-text)]"
                >
                  {key}: {String(filters[key])}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="neu-panel rounded-[34px] p-4">
        {loading ? (
          <PageLoader label="Loading" detail="Preparing employee records" compact />
        ) : filteredEmployees.length === 0 ? (
          <div className="neu-inset rounded-[28px] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--lms-text)]">
              No employees found
            </p>
            <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
              Try adjusting the search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="neu-table min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-4 text-left">
                    <SortHeader
                      label="Name"
                      field="name"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-4 text-left">
                    <SortHeader
                      label="Email"
                      field="email"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-4 text-left">
                    <SortHeader
                      label="Department"
                      field="department"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-4 text-left">
                    <SortHeader
                      label="Designation"
                      field="designation"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-4 text-left">Salary</th>
                  <th className="px-4 py-4 text-left">Status</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="px-4 py-4 font-medium text-[var(--lms-text)]">
                      {emp.name}
                    </td>
                    <td className="px-4 py-4 text-[var(--lms-text-soft)]">
                      {emp.email || "-"}
                    </td>
                    <td className="px-4 py-4 text-[var(--lms-text)]">
                      {emp.department || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="neu-badge rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--lms-text)]">
                        {emp.designation || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[var(--lms-text)]">
                      Rs {Number(emp.salary || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          emp.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {activeTab === "active" ? (
                          <>
                            <button
                              onClick={() => handleView(emp)}
                              className="neu-button h-10 w-10 rounded-[16px]"
                              title="View"
                            >
                              <Eye size={16} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => handleEdit(emp)}
                              className="neu-button h-10 w-10 rounded-[16px]"
                              title="Edit"
                            >
                              <Edit size={16} className="mx-auto" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(emp._id)}
                              className="neu-button rounded-[16px] px-3 py-2 text-xs font-semibold"
                              title="Toggle Status"
                            >
                              {emp.isActive ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(emp)}
                              className="neu-button-danger rounded-[16px] px-3 py-2 text-xs font-semibold"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(emp._id)}
                            className="neu-button rounded-[16px] px-4 py-2 text-sm font-semibold text-emerald-700"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Pagination
        page={activeTab === "active" ? page : trashPage}
        totalPages={activeTab === "active" ? totalPages : trashTotalPages}
        onPageChange={(p) =>
          activeTab === "active" ? setPage(p) : setTrashPage(p)
        }
      />

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
