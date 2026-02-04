import { useState } from "react";
import axiosInstance from "../../../api/axios";

const NotInterestedModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    notInterestedReason: "",
    followUpDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !visitor) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.notInterestedReason.trim()) {
      setError("Please provide a reason");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        `/visitor/${visitor._id}/not-interested`,
        form
      );

      if (res?.data) {
        onSuccess(res.data.visitor);
        onClose();
        setForm({ notInterestedReason: "", followUpDate: "" });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark as not interested");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Mark as Not Interested
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Reason for Not Being Interested *
            </label>
            <textarea
              name="notInterestedReason"
              value={form.notInterestedReason}
              onChange={handleChange}
              placeholder="Enter the reason why the visitor is not interested..."
              required
              rows={4}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF] mt-1">
              Set a date when this visitor can be contacted again
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg text-[#3F72AF] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Mark as Not Interested"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotInterestedModal;
