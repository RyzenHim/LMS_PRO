import React, { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw, BookOpen } from "lucide-react";
import { courseService } from "../../services/courseService";
import AddCourseModal from "./modal/AddCourseModal";
import EditCourseModal from "./modal/EditCourseModal";
import ViewCourseModal from "./modal/ViewCourseModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

const AdminCourses = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchDeletedCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getAll();
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedCourses = async () => {
    try {
      const res = await courseService.getDeleted();
      setDeletedCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching deleted courses", error);
    }
  };

  const handleAddCourse = async (data) => {
    try {
      const res = await courseService.create(data);
      setCourses((prev) => [res.data.course, ...prev]);
      setOpenAdd(false);
    } catch (error) {
      console.error("Add course failed", error);
      alert(error.response?.data?.message || "Failed to add course");
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setOpenEdit(true);
  };

  const handleUpdateCourse = async (data) => {
    try {
      const res = await courseService.update(selectedCourse._id, data);
      setCourses((prev) =>
        prev.map((c) => (c._id === selectedCourse._id ? res.data.course : c))
      );
      setOpenEdit(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update course");
    }
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setOpenView(true);
  };

  const handleDeleteClick = (course) => {
    setSelectedCourse(course);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await courseService.softDelete(selectedCourse._id);
      setCourses((prev) => prev.filter((c) => c._id !== selectedCourse._id));
      fetchDeletedCourses();
      setOpenDelete(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete course");
    }
  };

  const handleRestore = async (id) => {
    try {
      await courseService.restore(id);
      setDeletedCourses((prev) => prev.filter((c) => c._id !== id));
      fetchCourses();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore course");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await courseService.toggleStatus(id);
      setCourses((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isActive: res.data.isActive } : c))
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredCourses =
    activeTab === "active"
      ? courses.filter(
          (c) =>
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.category?.toLowerCase().includes(search.toLowerCase()) ||
            c.tutorName?.toLowerCase().includes(search.toLowerCase()) ||
            c.tutor?.name?.toLowerCase().includes(search.toLowerCase())
        )
      : deletedCourses.filter(
          (c) =>
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.category?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Courses
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage all LMS courses
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Course
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
          Active ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Trash ({deletedCourses.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 flex items-center gap-3">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading courses...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Course</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Category</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Tutor</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Price</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Level</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Students</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Skills</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">Is Active</th>
                  <th className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr
                    key={course._id}
                    className="border-b dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-600" />
                      {course.title}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{course.category}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {course.tutorName || course.tutor?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">₹{course.price || 0}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{course.duration || 0} hrs</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">{course.level}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{course.studentsEnrolled || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {course.skills && course.skills.length > 0 ? (
                          course.skills.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 capitalize"
                            >
                              {typeof skill === "object" ? skill.name : skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                        {course.skills && course.skills.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{course.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md capitalize ${
                          course.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : course.status === "archived"
                            ? "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          course.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {course.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(course)}
                            className="text-indigo-600 hover:underline text-sm dark:text-indigo-400"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-blue-600 hover:underline text-sm dark:text-blue-400"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(course._id)}
                            className="text-yellow-600 hover:underline text-sm dark:text-yellow-400"
                            title="Toggle Status"
                          >
                            {course.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course)}
                            className="text-red-600 hover:underline text-sm dark:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(course._id)}
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

        {!loading && filteredCourses.length === 0 && (
          <div className="p-6 text-center text-gray-500 text-sm">
            No courses found
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCourseModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddCourse}
      />
      <EditCourseModal
        open={openEdit}
        course={selectedCourse}
        onClose={() => {
          setOpenEdit(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleUpdateCourse}
      />
      <ViewCourseModal
        open={openView}
        course={selectedCourse}
        onClose={() => {
          setOpenView(false);
          setSelectedCourse(null);
        }}
      />
      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleDelete}
        title={selectedCourse?.title}
      />
    </div>
  );
};

export default AdminCourses;
