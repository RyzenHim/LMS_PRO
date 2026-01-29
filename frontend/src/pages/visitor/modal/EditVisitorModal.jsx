import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";

const EditVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    course: "",
    note: "",
    status: "new",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- PREFILL FORM ---------------- */
  useEffect(() => {
    if (visitor) {
      setForm({
        name: visitor.name || "",
        email: visitor.email || "",
        phone: visitor.phone || "",
        source: visitor.source || "other",
        course: visitor.course || "",
        note: visitor.note || "",
        status: visitor.status || "new",
      });
    }
  }, [visitor]);

  if (!open || !visitor) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10,}$/.test(form.phone)) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.put(`/visitor/${visitor._id}`, form);

      if (res?.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update visitor");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Visitor</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="call">Call</option>
            <option value="walk-in">Walk-in</option>
            <option value="email">Email</option>
            <option value="referral">Referral</option>
            <option value="other">Other</option>
          </select>

          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select Course</option>
            <option value="MERN Stack">MERN Stack</option>
            <option value="Java Full Stack">Java Full Stack</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>

          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Visitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVisitorModal;
