import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, RotateCcw } from "lucide-react";

import { skillService } from "../../services/skillService";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";

//#101010

const AdminSkills = () => {
  // ── Data ──────────────────────────────────────────
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Tabs ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("active");

  // ── Search ────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Sort ──────────────────────────────────────────
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // ── Filters ───────────────────────────────────────
  const [filterIsActive, setFilterIsActive] = useState(""); // "" | "true" | "false"
  const [filterCategory, setFilterCategory] = useState("");

  // ── Pagination ────────────────────────────────────
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Modals ────────────────────────────────────────
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // ── Form ──────────────────────────────────────────
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  // ─────────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────────
  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search,
        sortBy,
        sortOrder,
      };

      // Only send isActive filter on active tab
      if (activeTab === "active" && filterIsActive !== "") {
        params.isActive = filterIsActive;
      }

      if (filterCategory.trim()) {
        params.category = filterCategory.trim();
      }

      const fn =
        activeTab === "active" ? skillService.getAll : skillService.getDeleted;
      const res = await fn(params);

      const data = res?.data ?? res;
      setSkills(data?.skills ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch (error) {
      console.error("Fetch skills error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever any of these change
  useEffect(() => {
    fetchSkills();
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterIsActive,
    filterCategory,
  ]);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ─────────────────────────────────────────────────
  // SORT
  // ─────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // ─────────────────────────────────────────────────
  // ADD
  // ─────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await skillService.create(form);
      setForm({ name: "", description: "", category: "" });
      setOpenAdd(false);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add skill");
    }
  };

  // ─────────────────────────────────────────────────
  // EDIT
  // ─────────────────────────────────────────────────
  const handleEditOpen = (skill) => {
    setSelectedSkill(skill);
    setForm({
      name: skill.name,
      description: skill.description || "",
      category: skill.category || "",
    });
    setOpenEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await skillService.update(selectedSkill._id, form);
      setOpenEdit(false);
      setSelectedSkill(null);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update skill");
    }
  };

  // ─────────────────────────────────────────────────
  // DELETE (soft)
  // ─────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await skillService.softDelete(selectedSkill._id);
      setOpenDelete(false);
      setSelectedSkill(null);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete skill");
    }
  };

  // ─────────────────────────────────────────────────
  // RESTORE
  // ─────────────────────────────────────────────────
  const handleRestore = async (id) => {
    try {
      await skillService.restore(id);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to restore skill");
    }
  };

  // ─────────────────────────────────────────────────
  // TOGGLE STATUS
  // ─────────────────────────────────────────────────
  const handleToggleStatus = async (id) => {
    try {
      await skillService.toggleStatus(id);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to toggle status");
    }
  };

  // ─────────────────────────────────────────────────
  // SORT ARROW HELPER
  // ─────────────────────────────────────────────────
  const SortArrow = ({ field }) => {
    if (sortBy !== field)
      return <span className="ml-1 text-xs opacity-30">↕</span>;
    return (
      <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
    );
  };

  // ─────────────────────────────────────────────────
  // SHARED INPUT STYLES (matching your other modals)
  // ─────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-[#DBE2EF] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition text-sm";

  const selectCls =
    "w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition text-sm";

  // ─────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-1">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#212121] dark:text-[#DBE2EF]">
            Skills
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-slate-400 mt-0.5">
            Manage skills for courses
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => {
              setForm({ name: "", description: "", category: "" });
              setOpenAdd(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#212121] text-white text-sm font-semibold transition shadow-sm"
          >
            <Plus size={16} />
            Add Skill
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-[#DBE2EF] dark:border-slate-700 pb-0">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === "active"
              ? "border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF] dark:border-[#DBE2EF]"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-[#3F72AF] dark:hover:text-[#DBE2EF]"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === "trash"
              ? "border-red-500 text-red-500 dark:text-red-400 dark:border-red-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
          }`}
        >
          Trash
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white dark:bg-[#212121] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]/50 p-3 flex items-center gap-3 shadow-sm">
        <Search
          size={16}
          className="text-[#3F72AF] dark:text-slate-400 shrink-0"
        />
        <input
          type="text"
          placeholder="Search by name, category or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full outline-none text-sm bg-transparent text-[#212121] dark:text-[#DBE2EF] placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-[#212121] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]/50 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Filters
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* isActive filter — only useful on Active tab */}
          {activeTab === "active" && (
            <div>
              <label className="block text-xs font-medium text-[#212121] dark:text-[#DBE2EF] mb-1">
                Status
              </label>
              <select
                value={filterIsActive}
                onChange={(e) => {
                  setFilterIsActive(e.target.value);
                  setPage(1);
                }}
                className={selectCls}
              >
                <option value="">All (Active & Inactive)</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            </div>
          )}

          {/* Category filter */}
          <div>
            <label className="block text-xs font-medium text-[#212121] dark:text-[#DBE2EF] mb-1">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend, Backend..."
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className={inputCls}
            />
          </div>
        </div>

        {/* Clear filters button */}
        {(filterIsActive !== "" || filterCategory) && (
          <button
            onClick={() => {
              setFilterIsActive("");
              setFilterCategory("");
              setPage(1);
            }}
            className="mt-3 text-xs text-red-500 hover:text-red-600 dark:text-red-400 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#212121] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]/50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading skills...
          </div>
        ) : skills.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No skills found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#DBE2EF]/60 dark:bg-slate-800/60 border-b border-[#DBE2EF] dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="font-semibold text-xs uppercase tracking-wider text-[#212121] dark:text-[#DBE2EF] flex items-center"
                    >
                      Name <SortArrow field="name" />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider text-[#212121] dark:text-[#DBE2EF]">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider text-[#212121] dark:text-[#DBE2EF]">
                    Description
                  </th>
                  {activeTab === "active" && (
                    <th className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider text-[#212121] dark:text-[#DBE2EF]">
                      Status
                    </th>
                  )}
                  <th className="px-5 py-3 text-left font-semibold text-xs uppercase tracking-wider text-[#212121] dark:text-[#DBE2EF]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#DBE2EF] dark:divide-slate-700/50">
                {skills.map((skill) => (
                  <tr
                    key={skill._id}
                    className="hover:bg-[#F9F7F7] dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5 font-medium text-[#212121] dark:text-[#DBE2EF] capitalize">
                      {skill.name}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-[#3F72AF] dark:text-slate-300">
                      {skill.category || "—"}
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-[240px]">
                      <span className="line-clamp-1">
                        {skill.description || "—"}
                      </span>
                    </td>

                    {/* Status pill — active tab only */}
                    {activeTab === "active" && (
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            skill.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
                          }`}
                        >
                          {skill.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(skill._id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          {/* Edit */}
                          <button
                            onClick={() => handleEditOpen(skill)}
                            className="text-[#3F72AF] dark:text-slate-300 hover:text-[#212121] dark:hover:text-white transition"
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleStatus(skill._id)}
                            className={`text-xs font-medium transition ${
                              skill.isActive
                                ? "text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                : "text-green-600 dark:text-green-400 hover:text-green-700"
                            }`}
                            title={skill.isActive ? "Deactivate" : "Activate"}
                          >
                            {skill.isActive ? "Disable" : "Enable"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setSelectedSkill(skill);
                              setOpenDelete(true);
                            }}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* ── Add Modal ── */}
      {openAdd && (
        <SimpleModal
          title="Add Skill"
          form={form}
          setForm={setForm}
          onSubmit={handleAdd}
          onClose={() => setOpenAdd(false)}
          submitLabel="Add Skill"
        />
      )}

      {/* ── Edit Modal ── */}
      {openEdit && (
        <SimpleModal
          title="Edit Skill"
          form={form}
          setForm={setForm}
          onSubmit={handleUpdate}
          onClose={() => {
            setOpenEdit(false);
            setSelectedSkill(null);
          }}
          submitLabel="Update Skill"
        />
      )}

      {/* ── Delete Confirm Modal ── */}
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

// ─────────────────────────────────────────────────────
// SIMPLE MODAL — reused for Add and Edit
// Same styling as your AddVisitorModal / EditVisitorModal
// ─────────────────────────────────────────────────────
const SimpleModal = ({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  submitLabel,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const inputCls =
    "mt-1.5 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-[#DBE2EF] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal box */}
      <div className="relative w-full max-w-md rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#212121] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DBE2EF] dark:border-slate-700">
          <h2 className="text-base font-bold text-[#212121] dark:text-[#DBE2EF]">
            {title}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-[#212121] dark:text-[#DBE2EF]">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. React, Node.js"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#212121] dark:text-[#DBE2EF]">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Frontend, Backend"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#212121] dark:text-[#DBE2EF]">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-[#212121] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold transition"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSkills;
