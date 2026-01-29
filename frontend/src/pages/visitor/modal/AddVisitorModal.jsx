import { useState } from "react";
import axios from "axios";
import axiosInstance from "../../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const AddVisitorModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  /* ---------------- HANDLERS ---------------- */
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

    // if (!/^\d{10,}$/.test(form.phone)) {
    //   setError("Phone number must be at least 10 digits");
    //   return;
    // }

    try {
      setLoading(true);

      const res = await axiosInstance.post(`/visitor/`, form, {
        withCredentials: true,
      });

      if (res?.data) {
        onSuccess(res.data); // push to list
        onClose();
        setForm({
          name: "",
          email: "",
          phone: "",
          source: "other",
          note: "",
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add visitor");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Add Visitor</h2>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            placeholder="Phone (min 10 digits)"
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

          <textarea
            name="note"
            placeholder="Note"
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
              {loading ? "Saving..." : "Add Visitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisitorModal;
