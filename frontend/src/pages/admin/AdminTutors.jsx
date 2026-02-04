import React, { useState, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { tutorService } from "../../services/tutorService";
import AddTutorModal from "./modal/AddTutorModal";
import EditTutorModal from "./modal/EditTutorModal";
import ViewTutorModal from "./modal/ViewTutorModal";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

const AdminTutors = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [deletedTutors, setDeletedTutors] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  useEffect(() => {
    fetchTutors();
    fetchDeletedTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const res = await tutorService.getAll();
      setTutors(res.data || []);
    } catch (error) {
      console.error("Error fetching tutors", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedTutors = async () => {
    try {
      const res = await tutorService.getDeleted();
      setDeletedTutors(res.data || []);
    } catch (error) {
      console.error("Error fetching deleted tutors", error);
    }
  };

  const handleAddTutor = async (data) => {
    try {
      const res = await tutorService.create(data);
      setTutors((prev) => [res.data.tutor, ...prev]);
      setOpenAdd(false);
    } catch (error) {
      console.error("Add tutor failed", error);
      alert(error.response?.data?.message || "Failed to add tutor");
    }
  };

  const handleEdit = (tutor) => {
    setSelectedTutor(tutor);
    setOpenEdit(true);
  };

  const handleUpdateTutor = async (data) => {
    try {
      const res = await tutorService.update(selectedTutor._id, data);
      setTutors((prev) =>
        prev.map((t) => (t._id === selectedTutor._id ? res.data.tutor : t))
      );
      setOpenEdit(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update tutor");
    }
  };

  const handleView = (tutor) => {
    setSelectedTutor(tutor);
    setOpenView(true);
  };

  const handleDeleteClick = (tutor) => {
    setSelectedTutor(tutor);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await tutorService.softDelete(selectedTutor._id);
      setTutors((prev) => prev.filter((t) => t._id !== selectedTutor._id));
      fetchDeletedTutors();
      setOpenDelete(false);
      setSelectedTutor(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete tutor");
    }
  };

  const handleRestore = async (id) => {
    try {
      await tutorService.restore(id);
      setDeletedTutors((prev) => prev.filter((t) => t._id !== id));
      fetchTutors();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore tutor");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await tutorService.toggleStatus(id);
      setTutors((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: res.data.isActive } : t))
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredTutors =
    activeTab === "active"
      ? tutors.filter(
          (t) =>
            t.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase()) ||
            t.expertise?.toLowerCase().includes(search.toLowerCase())
        )
      : deletedTutors.filter(
          (t) =>
            t.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.email?.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Tutors
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage instructors & tutors
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Tutor
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
          Active ({tutors.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedTutors.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading tutors...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Name</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Email</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Phone</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Expertise</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Experience</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Qualification</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Salary</th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">Is Active</th>
                  <th className="px-6 py-3 text-right text-[#112D4E] dark:text-[#DBE2EF]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTutors.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF]">{t.name}</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">{t.email}</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">{t.phone || "—"}</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">{t.expertise}</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">{t.experience || 0} years</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">{t.qualification || "—"}</td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">₹{t.salary || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          t.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {t.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {activeTab === "active" ? (
                        <>
                          <button
                            onClick={() => handleView(t)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="inline" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(t._id)}
                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm transition-colors"
                            title="Toggle Status"
                          >
                            {t.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(t)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="inline" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(t._id)}
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

        {!loading && filteredTutors.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No tutors found
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTutorModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddTutor}
      />
      <EditTutorModal
        open={openEdit}
        tutor={selectedTutor}
        onClose={() => {
          setOpenEdit(false);
          setSelectedTutor(null);
        }}
        onSubmit={handleUpdateTutor}
      />
      <ViewTutorModal
        open={openView}
        tutor={selectedTutor}
        onClose={() => {
          setOpenView(false);
          setSelectedTutor(null);
        }}
      />
      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedTutor(null);
        }}
        onConfirm={handleDelete}
        title={selectedTutor?.name}
      />
    </div>
  );
};

export default AdminTutors;
