import { useEffect, useState } from "react";
import { X, Ban, CalendarDays } from "lucide-react";
import axiosInstance from "../../../api/axios";

const NotInterestedModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    notInterestedReason: "",
    followUpDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // reset on open
  useEffect(() => {
    if (!open) return;

    setForm({
      notInterestedReason: "",
      followUpDate: "",
    });
    setError("");
    setLoading(false);
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !visitor) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.notInterestedReason.trim()) {
      setError("Please provide a reason.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        notInterestedReason: form.notInterestedReason.trim(),
        followUpDate: form.followUpDate || null,
      };

      const res = await axiosInstance.patch(
        `/visitor/${visitor._id}/not-interested`,
        payload,
      );

      if (res?.data) {
        onSuccess?.(res.data.visitor);
        onClose?.();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to mark as not interested",
      );
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={() => (loading ? null : onClose?.())}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#112D4E] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[#DBE2EF] dark:border-slate-700 bg-gradient-to-r from-orange-50 to-white dark:from-orange-500/10 dark:to-slate-900">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-orange-100 dark:bg-orange-500/20 p-2">
              <Ban className="text-orange-600 dark:text-orange-300" size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Mark as Not Interested
              </h2>
              <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-0.5">
                This visitor will move to the “Not Interested” tab
              </p>
            </div>
          </div>

          <button
            onClick={() => (loading ? null : onClose?.())}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-[#DBE2EF] dark:hover:bg-slate-800 text-[#3F72AF] dark:text-[#DBE2EF] disabled:opacity-60"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Reason <span className="text-red-500">*</span>
            </label>

            <textarea
              name="notInterestedReason"
              value={form.notInterestedReason}
              onChange={handleChange}
              placeholder="Example: Not interested in this course / budget issue / already enrolled elsewhere..."
              required
              rows={4}
              className="w-full resize-none rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#0a1f3a] px-3 py-2.5 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400 transition"
            />

            <p className="mt-1 text-xs text-[#3F72AF] dark:text-slate-300">
              Keep it short and clear — it helps future reporting.
            </p>
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Follow-up Date (Optional)
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3F72AF] dark:text-slate-300"
              />

              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                min={today}
                className="w-full rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#0a1f3a] pl-10 pr-3 py-2.5 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-orange-400/60 focus:border-orange-400 transition"
              />
            </div>

            <p className="mt-1 text-xs text-[#3F72AF] dark:text-slate-300">
              If you want to contact them later, set a reminder date here.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => (loading ? null : onClose?.())}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-slate-800 disabled:opacity-60 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-60 transition"
            >
              {loading ? "Saving..." : "Mark Not Interested"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotInterestedModal;
