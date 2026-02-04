import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, RotateCcw } from "lucide-react";
import { skillService } from "../../services/skillService";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";

const AdminSkills = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [deletedSkills, setDeletedSkills] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
  });

  useEffect(() => {
    fetchSkills();
    fetchDeletedSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await skillService.getAll();
      setSkills(res.data || []);
    } catch (error) {
      console.error("Error fetching skills", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedSkills = async () => {
    try {
      const res = await skillService.getDeleted();
      setDeletedSkills(res.data || []);
    } catch (error) {
      console.error("Error fetching deleted skills", error);
    }
  };

  const handleAddSkill = async () => {
    try {
      const res = await skillService.create(form);
      setSkills((prev) => [res.data.skill, ...prev]);
      setForm({ name: "", description: "", category: "" });
      setOpenAdd(false);
    } catch (error) {
      console.error("Add skill failed", error);
      alert(error.response?.data?.message || "Failed to add skill");
    }
  };

  const handleEdit = (skill) => {
    setSelectedSkill(skill);
    setForm({
      name: skill.name,
      description: skill.description || "",
      category: skill.category || "",
    });
    setOpenEdit(true);
  };

  const handleUpdateSkill = async () => {
    try {
      const res = await skillService.update(selectedSkill._id, form);
      setSkills((prev) =>
        prev.map((s) => (s._id === selectedSkill._id ? res.data.skill : s)),
      );
      setOpenEdit(false);
      setSelectedSkill(null);
      setForm({ name: "", description: "", category: "" });
    } catch (error) {
      console.error("Update failed", error);
      alert(error.response?.data?.message || "Failed to update skill");
    }
  };

  const handleDeleteClick = (skill) => {
    setSelectedSkill(skill);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await skillService.softDelete(selectedSkill._id);
      setSkills((prev) => prev.filter((s) => s._id !== selectedSkill._id));
      fetchDeletedSkills();
      setOpenDelete(false);
      setSelectedSkill(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert(error.response?.data?.message || "Failed to delete skill");
    }
  };

  const handleRestore = async (id) => {
    try {
      await skillService.restore(id);
      setDeletedSkills((prev) => prev.filter((s) => s._id !== id));
      fetchSkills();
    } catch (error) {
      console.error("Restore failed", error);
      alert(error.response?.data?.message || "Failed to restore skill");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await skillService.toggleStatus(id);
      setSkills((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, isActive: res.data.isActive } : s,
        ),
      );
    } catch (error) {
      console.error("Toggle status failed", error);
      alert(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const filteredSkills =
    activeTab === "active"
      ? skills.filter(
          (s) =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.category?.toLowerCase().includes(search.toLowerCase()) ||
            s.description?.toLowerCase().includes(search.toLowerCase()),
        )
      : deletedSkills.filter(
          (s) =>
            s.name?.toLowerCase().includes(search.toLowerCase()) ||
            s.category?.toLowerCase().includes(search.toLowerCase()),
        );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Skills
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Manage skills for courses
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors shadow-md"
          >
            <Plus size={18} />
            Add Skill
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "active"
              ? "border-b-2 border-[#3F72AF] font-medium text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Active ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`pb-2 px-2 transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-600 font-medium text-red-600 dark:text-red-400 dark:border-red-400"
              : "text-[#3F72AF] dark:text-[#DBE2EF]"
          }`}
        >
          Trash ({deletedSkills.length})
        </button>
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-4 flex items-center gap-3 shadow-sm">
        <Search size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
        />
      </div>

      <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading skills...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF] border-b border-[#DBE2EF] dark:border-[#3F72AF]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-[#112D4E] dark:text-[#DBE2EF]">
                    Description
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
                {filteredSkills.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-[#DBE2EF] dark:border-[#3F72AF] last:border-none hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                      {s.name}
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.category || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#3F72AF] dark:text-[#DBE2EF]">
                      {s.description || "—"}
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
                            onClick={() => handleEdit(s)}
                            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white text-sm transition-colors"
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

        {!loading && filteredSkills.length === 0 && (
          <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF] text-sm">
            No skills found
          </div>
        )}
      </div>

      {openAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#DBE2EF] dark:border-[#3F72AF]">
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
              Add Skill
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSkill();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenAdd(false);
                    setForm({ name: "", description: "", category: "" });
                  }}
                  className="px-4 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg text-[#3F72AF] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-md shadow-2xl border border-[#DBE2EF] dark:border-[#3F72AF]">
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
              Edit Skill
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSkill();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Category
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenEdit(false);
                    setSelectedSkill(null);
                    setForm({ name: "", description: "", category: "" });
                  }}
                  className="px-4 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg text-[#3F72AF] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors"
                >
                  Update Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setSelectedSkill(null);
        }}
        onConfirm={handleDelete}
        title={selectedSkill?.name}
      />
    </div>
  );
};

export default AdminSkills;
