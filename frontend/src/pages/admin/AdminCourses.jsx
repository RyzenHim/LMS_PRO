import React, { useState } from "react";
import { Search, Plus, BookOpen } from "lucide-react";

const AdminCourses = () => {
  const [search, setSearch] = useState("");

  // TEMP DATA (replace with API)
  const courses = [
    {
      id: 1,
      title: "React Fundamentals",
      category: "Frontend",
      tutor: "Ankit Verma",
      students: 120,
      status: "Published",
    },
    {
      id: 2,
      title: "Node.js & Express",
      category: "Backend",
      tutor: "Sneha Gupta",
      students: 85,
      status: "Draft",
    },
    {
      id: 3,
      title: "MongoDB Basics",
      category: "Database",
      tutor: "Rahul Singh",
      students: 60,
      status: "Published",
    },
  ];

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Courses
          </h1>
          <p className="text-sm text-gray-500">
            Manage all LMS courses
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
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
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Tutor</th>
              <th className="px-6 py-3 text-left">Students</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCourses.map((course) => (
              <tr
                key={course.id}
                className="border-b last:border-none hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" />
                  {course.title}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {course.category}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {course.tutor}
                </td>
                <td className="px-6 py-4">
                  {course.students}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-md ${
                      course.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-indigo-600 hover:underline text-sm">
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCourses.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No courses found
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
