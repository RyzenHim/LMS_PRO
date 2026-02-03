import React, { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import AddEmployeeModal from "./modal/AddEmployeeModal";
import { employeeService } from "../../services/employeeService";
import Admin_EditEmployeeModal from "./modal/employee/Admin_EditEmployeeModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import ViewEmployeeModal from "./modal/ViewEmployeeModal";

const AdminEmployees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [allEmp, setAllEmp] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchDeletedEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getAll();
      setAllEmp(res.data || []);
    } catch (error) {
      console.error("Error fetching employees", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedEmployees = async () => {
    try {
      const res = await employeeService.getDeleted();
      setDeletedEmployees(res.data || []);
    } catch (error) {
      console.error("Error fetching deleted employees", error);
    }
  };

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
      const res = await employeeService.update(selectedEmp._id, data);
      setAllEmp((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmp._id ? res.data.employee : emp,
        ),
      );
      setOpenEdit(false);
      setSelectedEmp(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update employee");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await employeeService.toggleStatus(id);
      setAllEmp((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, isActive: res.data.isActive } : emp,
        ),
      );
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
      setAllEmp((prev) => prev.filter((emp) => emp._id !== selectedEmp._id));
      fetchDeletedEmployees();
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
      setDeletedEmployees((prev) => prev.filter((emp) => emp._id !== id));
      fetchEmployees();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore employee");
    }
  };

  const handleAddEmployee = async (data) => {
    try {
      const empData = {
        name: data.name,
        email: data.email,
        department: data.department,
        designation: data.role,
        salary: Number(data.salary),
      };

      const res = await employeeService.create(empData);
      setAllEmp((prev) => [...prev, res.data.employee]);
      setOpenAdd(false);
    } catch (error) {
      console.error("Add employee failed", error);
      alert(error.response?.data?.message || "Failed to add employee");
    }
  };

  const filteredEmployees =
    activeTab === "active"
      ? allEmp.filter(
          (emp) =>
            emp.name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email?.toLowerCase().includes(search.toLowerCase()) ||
            emp.department?.toLowerCase().includes(search.toLowerCase())
        )
      : deletedEmployees.filter(
          (emp) =>
            emp.name?.toLowerCase().includes(search.toLowerCase()) ||
            emp.email?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Employees
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage admin & HR employees
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Employee
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 ${
            activeTab === "active"
              ? "border-b-2 border-indigo-600 font-medium text-indigo-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Active ({allEmp.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Trash ({deletedEmployees.length})
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Department</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Designation</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Salary</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Joining Date</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Created At</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Updated At</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 font-medium dark:text-white">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{emp.email}</td>
                    <td className="px-4 py-3 dark:text-white">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="px-4 py-3 dark:text-white">₹{emp.salary}</td>
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
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                      {emp.joiningDate
                        ? new Date(emp.joiningDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                      {new Date(emp.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-300">
                      {new Date(emp.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(emp)}
                            className="text-indigo-600 hover:underline text-sm dark:text-indigo-400"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleEdit(emp)}
                            className="text-blue-600 hover:underline text-sm dark:text-blue-400"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(emp._id)}
                            className="text-yellow-600 hover:underline text-sm dark:text-yellow-400"
                            title="Toggle Status"
                          >
                            {emp.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(emp)}
                            className="text-red-600 hover:underline text-sm dark:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(emp._id)}
                          className="text-green-600 hover:underline text-sm dark:text-green-400 flex items-center gap-1"
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
          <div className="p-6 text-center text-gray-500">
            No employees found
          </div>
        )}
      </div>

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
        title={selectedEmp?.name}
      />
    </div>
  );
};

export default AdminEmployees;
