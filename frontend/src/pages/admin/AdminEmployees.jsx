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
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Employees
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage admin & HR employees
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
          Active ({allEmp.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedEmployees.length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Search className="text-[#3F72AF] dark:text-[#DBE2EF]" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
          />
        </div>
      </div>

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
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Name</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Email</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Department</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Designation</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Salary</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Status</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Joining Date</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Created At</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Updated At</th>
                  <th className="px-4 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#112D4E] dark:text-[#DBE2EF]">{emp.name}</td>
                    <td className="px-4 py-3 text-[#3F72AF] dark:text-[#DBE2EF]">{emp.email}</td>
                    <td className="px-4 py-3 text-[#112D4E] dark:text-[#DBE2EF]">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF]">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#112D4E] dark:text-[#DBE2EF]">₹{emp.salary}</td>
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
                    <td className="px-4 py-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {emp.joiningDate
                        ? new Date(emp.joiningDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {new Date(emp.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {new Date(emp.updatedAt).toLocaleString()}
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

        {!loading && filteredEmployees.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
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
