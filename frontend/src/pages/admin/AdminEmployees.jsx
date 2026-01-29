import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import AddEmployeeModal from "./modal/AddEmployeeModal";
import axiosInstance from "../../api/axios";
import Admin_EditEmployeeModal from "./modal/employee/Admin_EditEmployeeModal";

const AdminEmployees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [allEmp, setAllEmp] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  useEffect(() => {
    const getAllEmp = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/emp/allEmp", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAllEmp(res.data);
      } catch (error) {
        console.error("Error fetching employees", error);
      } finally {
        setLoading(false);
      }
    };

    getAllEmp();
  }, []);
  const handleEdit = (emp) => {
    setSelectedEmp(emp);
    setOpenEdit(true);
  };
  const handleUpdateEmployee = async (data) => {
    await axiosInstance.put(`/emp/${selectedEmp._id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setAllEmp((prev) =>
      prev.map((emp) =>
        emp._id === selectedEmp._id ? { ...emp, ...data } : emp,
      ),
    );
  };
  const handleDelete = async (id) => {
    try {
      await axiosInstance.patch(
        `/emp/${id}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setAllEmp((prev) =>
        prev.map((emp) =>
          emp._id === id ? { ...emp, isActive: !emp.isActive } : emp,
        ),
      );
    } catch (error) {
      console.error("Error toggling employee status", error);
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

      await axiosInstance.post("/emp/addEmp", empData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOpenAdd(false);
      setAllEmp((prev) => [...prev, empData]); // quick UI update
    } catch (error) {
      console.error(error);
    }
  };

  const filteredEmployees = allEmp.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Manage admin & HR employees</p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading employees...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Designation</th>
                <th className="px-4 py-3 text-left">Salary</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joining Date</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-left">Updated At</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp._id}
                  className="border-b last:border-none hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{emp.name}</td>

                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>

                  <td className="px-4 py-3">{emp.department}</td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700">
                      {emp.designation}
                    </span>
                  </td>

                  <td className="px-4 py-3">₹{emp.salary}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-md ${
                        emp.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {emp.joiningDate
                      ? new Date(emp.joiningDate).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(emp.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(emp.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      {emp.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        onClose={() => setOpenEdit(false)}
        onSubmit={handleUpdateEmployee}
      />
    </div>
  );
};

export default AdminEmployees;
