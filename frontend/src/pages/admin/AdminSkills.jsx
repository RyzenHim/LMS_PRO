import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Sparkles,
  Layers3,
  CheckCircle2,
} from "lucide-react";

import { skillService } from "../../services/skillService";
import ConfirmDeleteModal from "./modal/ConfirmDeleteModal";
import Pagination from "../../components/Pagination";
import ModalShell from "../../components/ui/ModalShell";
import PageLoader from "../../components/ui/PageLoader";

const fieldClass =
  "neu-input mt-2 w-full rounded-[22px] px-4 py-3 text-sm text-[var(--lms-text)] placeholder:text-[var(--lms-text-soft)]";

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterIsActive, setFilterIsActive] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", category: "" });

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, sortBy, sortOrder };
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

  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    page,
    search,
    sortBy,
    sortOrder,
    filterIsActive,
    filterCategory,
  ]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

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

  const handleRestore = async (id) => {
    try {
      await skillService.restore(id);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to restore skill");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await skillService.toggleStatus(id);
      fetchSkills();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to toggle status");
    }
  };

  const activeSkillCount = skills.filter((skill) => skill.isActive).length;

  return (
    <div className="lms-page-enter space-y-6">
      <section className="neu-panel lms-card-hover lms-sheen rounded-[34px] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--lms-accent-soft)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lms-accent-strong)]">
              <Sparkles size={14} />
              Skill Library
            </div>
            <h1 className="text-3xl font-semibold text-[var(--lms-text)]">
              Skills
            </h1>
            <p className="max-w-2xl text-sm text-[var(--lms-text-soft)]">
              Curate reusable skills with clearer hierarchy, softer depth, and a
              more premium editing flow.
            </p>
          </div>

          {activeTab === "active" ? (
            <button
              onClick={() => {
                setForm({ name: "", description: "", category: "" });
                setOpenAdd(true);
              }}
              className="neu-button neu-button-primary rounded-[24px] px-5 py-3 text-sm font-semibold"
            >
              <Plus size={16} />
              Add Skill
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Visible Records", value: skills.length, icon: Layers3 },
            {
              label: "Active Skills",
              value: activeSkillCount,
              icon: CheckCircle2,
            },
            {
              label: "Category Filters",
              value: filterCategory ? 1 : 0,
              icon: Search,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="neu-panel-soft rounded-[28px] p-4">
                <div className="flex items-center gap-3">
                  <div className="neu-inset flex h-12 w-12 items-center justify-center rounded-[18px]">
                    <Icon size={18} className="text-[var(--lms-accent-strong)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--lms-text)]">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="neu-panel rounded-[32px] p-4">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "active", label: "Active" },
            { key: "trash", label: "Trash" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[22px] px-4 py-2.5 text-sm font-semibold ${
                activeTab === tab.key
                  ? tab.key === "trash"
                    ? "neu-button-danger"
                    : "neu-button neu-button-primary"
                  : "neu-button"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr,1fr]">
        <div className="neu-panel rounded-[32px] p-4">
          <div className="neu-inset flex items-center gap-3 rounded-[24px] px-4 py-3">
            <Search className="text-[var(--lms-accent-strong)]/70" size={16} />
            <input
              type="text"
              placeholder="Search by name, category or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-transparent text-sm text-[var(--lms-text)] outline-none placeholder:text-[var(--lms-text-soft)]"
            />
          </div>
        </div>

        <div className="neu-panel rounded-[32px] p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {activeTab === "active" ? (
              <select
                value={filterIsActive}
                onChange={(e) => {
                  setFilterIsActive(e.target.value);
                  setPage(1);
                }}
                className="neu-input rounded-[20px] px-4 py-3 text-sm"
              >
                <option value="">All Status</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            ) : (
              <div className="neu-inset rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text-soft)]">
                Trash view ignores active status filter.
              </div>
            )}

            <input
              type="text"
              placeholder="Filter by category"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setPage(1);
              }}
              className="neu-input rounded-[20px] px-4 py-3 text-sm"
            />
          </div>

          {filterIsActive !== "" || filterCategory ? (
            <button
              onClick={() => {
                setFilterIsActive("");
                setFilterCategory("");
                setPage(1);
              }}
              className="mt-4 neu-button rounded-[18px] px-4 py-2 text-xs font-semibold"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      <section className="neu-panel rounded-[34px] p-4">
        {loading ? (
          <PageLoader label="Loading" detail="Collecting skill records" compact />
        ) : skills.length === 0 ? (
          <div className="neu-inset rounded-[28px] px-6 py-12 text-center">
            <p className="text-base font-medium text-[var(--lms-text)]">
              No skills found
            </p>
            <p className="mt-2 text-sm text-[var(--lms-text-soft)]">
              Add a new skill or broaden your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="neu-table min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="inline-flex items-center gap-2 font-semibold text-[var(--lms-text)]"
                    >
                      Name
                      <span className="text-xs text-[var(--lms-text-soft)]">
                        {sortBy === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </span>
                    </button>
                  </th>
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-left">Description</th>
                  {activeTab === "active" ? (
                    <th className="px-5 py-4 text-left">Status</th>
                  ) : null}
                  <th className="px-5 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill._id}>
                    <td className="px-5 py-4 font-medium capitalize text-[var(--lms-text)]">
                      {skill.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="neu-badge rounded-full px-3 py-1.5 text-xs font-semibold text-[var(--lms-text)]">
                        {skill.category || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--lms-text-soft)]">
                      <span className="line-clamp-2">{skill.description || "-"}</span>
                    </td>
                    {activeTab === "active" ? (
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            skill.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {skill.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    ) : null}
                    <td className="px-5 py-4">
                      {activeTab === "trash" ? (
                        <button
                          onClick={() => handleRestore(skill._id)}
                          className="neu-button rounded-[16px] px-4 py-2 text-sm font-semibold text-emerald-700"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOpen(skill)}
                            className="neu-button h-10 w-10 rounded-[16px]"
                            title="Edit"
                          >
                            <Edit size={15} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(skill._id)}
                            className="neu-button rounded-[16px] px-3 py-2 text-xs font-semibold"
                          >
                            {skill.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSkill(skill);
                              setOpenDelete(true);
                            }}
                            className="neu-button-danger rounded-[16px] px-3 py-2 text-xs font-semibold"
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
      </section>

      {!loading ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      ) : null}

      <SkillModal
        open={openAdd}
        title="Add Skill"
        form={form}
        setForm={setForm}
        onSubmit={handleAdd}
        onClose={() => setOpenAdd(false)}
        submitLabel="Add Skill"
      />
      <SkillModal
        open={openEdit}
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

const SkillModal = ({
  open,
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  submitLabel,
}) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title={title}
    subtitle="Keep the structure crisp and reusable for course mapping."
    maxWidth="max-w-xl"
  >
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-[var(--lms-text)]">
          Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="React, Node.js, UI Systems"
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--lms-text)]">
          Category
        </label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="Frontend, Backend, Operations"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--lms-text)]">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Short description of when this skill is used."
          rows={4}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="neu-button neu-button-primary rounded-[20px] px-5 py-3 text-sm font-semibold"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  </ModalShell>
);

export default AdminSkills;
