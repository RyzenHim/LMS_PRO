import { useEffect, useState } from "react";
import { assignmentService } from "../../services/assignmentService";
import { tutorService } from "../../services/tutorService";
import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";

const initialForm = {
  title: "",
  description: "",
  batch: "",
  dueDate: "",
  status: "published",
};

const InstructorAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [batch, setBatch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await assignmentService.getMyAssignments({
        page,
        limit: 10,
        search,
        status,
        batch,
        sortBy,
        sortOrder,
      });
      setAssignments(res.data?.assignments || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await tutorService.getMeDashboard();
      setBatches(res.data?.batches || []);
    } catch {
      setBatches([]);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [page, search, status, batch, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setOpenForm(true);
  };

  const handleOpenEdit = (a) => {
    setEditing(a);
    setForm({
      title: a?.title || "",
      description: a?.description || "",
      batch: a?.batch?._id || "",
      dueDate: a?.dueDate ? new Date(a.dueDate).toISOString().slice(0, 10) : "",
      status: a?.status || "published",
    });
    setOpenForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editing?._id) {
        await assignmentService.updateAssignment(editing._id, form);
      } else {
        await assignmentService.createAssignment(form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm(initialForm);
      fetchAssignments();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this assignment?");
    if (!ok) return;
    try {
      await assignmentService.deleteAssignment(id);
      fetchAssignments();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete assignment");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Assignments
          </h1>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Create and manage batch assignments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm"
        >
          Add Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search title/description"
          className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E]"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={batch}
          onChange={(e) => {
            setBatch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#112D4E]"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg bg-white dark:bg-[#112D4E]">
        <table className="min-w-full text-sm">
          <thead className="bg-[#DBE2EF] dark:bg-[#3F72AF]">
            <tr>
              <th className="p-3 text-left">
                <SortHeader
                  label="Title"
                  field="title"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Course</th>
              <th className="p-3 text-left">
                <SortHeader
                  label="Due Date"
                  field="dueDate"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="p-3 text-left">
                <SortHeader
                  label="Status"
                  field="status"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a._id} className="border-t border-[#DBE2EF] dark:border-[#3F72AF]">
                  <td className="p-3">
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs opacity-80">{a.description || "-"}</p>
                  </td>
                  <td className="p-3">{a.batch?.name || "-"}</td>
                  <td className="p-3">{a.course?.title || "-"}</td>
                  <td className="p-3">
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 capitalize">{a.status || "-"}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="px-2 py-1 rounded border text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="px-2 py-1 rounded border text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {openForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              {editing ? "Edit Assignment" : "Add Assignment"}
            </h2>

            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Title"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Description"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
            />

            <select
              value={form.batch}
              onChange={(e) => setForm((p) => ({ ...p, batch: e.target.value }))}
              required
              disabled={Boolean(editing)}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
            />

            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InstructorAssignments;
