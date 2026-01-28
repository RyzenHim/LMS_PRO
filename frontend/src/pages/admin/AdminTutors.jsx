import React, { useState } from "react";
import { Search } from "lucide-react";

const AdminTutors = () => {
  const [search, setSearch] = useState("");

  const tutors = [
    {
      id: 1,
      name: "Ankit Verma",
      email: "ankit@tutor.com",
      expertise: "React",
      status: "Active",
    },
    {
      id: 2,
      name: "Sneha Gupta",
      email: "sneha@tutor.com",
      expertise: "Node.js",
      status: "Inactive",
    },
  ];

  const filteredTutors = tutors.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Tutors
        </h1>
        <p className="text-sm text-gray-500">
          Manage instructors & tutors
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search tutors..."
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
              <th className="px-6 py-3 text-left">Expertise</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTutors.map((t) => (
              <tr
                key={t.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium">
                  {t.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {t.email}
                </td>
                <td className="px-6 py-4">
                  {t.expertise}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      t.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.status}
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

        {filteredTutors.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No tutors found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTutors;
