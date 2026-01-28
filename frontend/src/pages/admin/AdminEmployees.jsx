import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

const AdminEmployees = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [allEmp, setAllEmp] = useState([]);
  const [addEmp, setAddEmp] = useState();

  // TEMP data (replace with API later)
  const employees = [
    {
      id: 1,
      name: "Amit Sharma",
      email: "amit@lms.com",
      role: "Admin",
      department: "Management",
      status: "Active",
    },
    {
      id: 2,
      name: "Neha Verma",
      email: "neha@lms.com",
      role: "HR",
      department: "Human Resources",
      status: "Active",
    },
    {
      id: 3,
      name: "Rahul Singh",
      email: "rahul@lms.com",
      role: "Admin",
      department: "Operations",
      status: "Inactive",
    },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Manage admin & HR employees</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {/* Search */}
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

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                Role
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                Department
              </th>
              <th className="text-left px-6 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-6 py-3 font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {emp.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700">
                    {emp.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      emp.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-indigo-600 hover:underline text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline text-sm">
                    Disable
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No employees found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEmployees;
