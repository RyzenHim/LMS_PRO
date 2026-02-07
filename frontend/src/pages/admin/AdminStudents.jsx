import React, { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { studentService } from "../../services/studentService";
import AddStudentModal from "./modal/AddStudentModal";
import EditStudentModal from "./modal/EditStudentModal";
import ViewStudentModal from "./modal/ViewStudentModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

const AdminStudents = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchDeletedStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll();
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Error fetching students", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedStudents = async () => {
    try {
      const res = await studentService.getDeleted();
      setDeletedStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching deleted students", error);
    }
  };

  const handleAddStudent = async (data) => {
    try {
      const res = await studentService.create(data);
      setStudents((prev) => [res.data.student, ...prev]);
      setOpenAdd(false);
    } catch (error) {
      console.error("Add student failed", error);
      alert(error.response?.data?.message || "Failed to add student");
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setOpenEdit(true);
  };

  const handleUpdateStudent = async (data) => {
    try {
      const res = await studentService.update(selectedStudent._id, data);
      setStudents((prev) =>
        prev.map((s) => (s._id === selectedStudent._id ? res.data.student : s)),
      );
      setOpenEdit(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update student");
    }
  };

  const handleView = (student) => {
    setSelectedStudent(student);
    setOpenView(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await studentService.softDelete(selectedStudent._id);
      setStudents((prev) => prev.filter((s) => s._id !== selectedStudent._id));
      fetchDeletedStudents();
      setOpenDelete(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete student");
    }
  };

  const handleRestore = async (id) => {
    try {
      await studentService.restore(id);
      setDeletedStudents((prev) => prev.filter((s) => s._id !== id));
      fetchStudents();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore student");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await studentService.toggleStatus(id);
      setStudents((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, isActive: res.data.isActive } : s,
        ),
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredStudents =
    activeTab === "active"
      ? students.filter(
          (s) =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.course?.toLowerCase().includes(search.toLowerCase()),
        )
      : deletedStudents.filter(
          (s) =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()),
        );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Students
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage enrolled students
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Student
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
          Active ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedStudents.length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading students...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Is Active
                  </th>
                  <th className="px-6 py-3 text-right text-[#112D4E] dark:text-[#DBE2EF]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.course}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md capitalize ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : s.status === "suspended"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.enrollmentDate
                        ? new Date(s.enrollmentDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          s.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {s.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(s)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleEdit(s)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(s._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {s.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(s)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(s._id)}
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

        {!loading && filteredStudents.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No students found
          </div>
        )}
      </div>

      <AddStudentModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddStudent}
      />
      <EditStudentModal
        open={openEdit}
        student={selectedStudent}
        onClose={() => {
          setOpenEdit(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleUpdateStudent}
      />
      <ViewStudentModal
        open={openView}
        student={selectedStudent}
        onClose={() => {
          setOpenView(false);
          setSelectedStudent(null);
        }}
      />
      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedStudent(null);
        }}
        onConfirm={handleDelete}
        title={selectedStudent?.name}
      />
    </div>
  );
};

export default AdminStudents;
