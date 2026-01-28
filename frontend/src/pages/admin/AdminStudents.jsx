import React, { useState } from "react";
import { Search } from "lucide-react";

const AdminStudents = () => {
  const [search, setSearch] = useState("");

  const students = [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@student.com",
      courseCount: 3,
      status: "Active",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@student.com",
      courseCount: 5,
      status: "Inactive",
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Students
        </h1>
        <p className="text-sm text-gray-500">
          Manage enrolled students
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Courses</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s) => (
              <tr
                key={s.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">
                  {s.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {s.email}
                </td>
                <td className="px-6 py-4">
                  {s.courseCount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      s.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredStudents.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No students found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
