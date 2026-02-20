import { useEffect, useState } from "react";
import { X, Ban, CalendarDays, Loader2 } from "lucide-react";
import axiosInstance from "../../../api/axios";

const NotInterestedModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    notInterestedReason: "",
    followUpDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setForm({ notInterestedReason: "", followUpDate: "" });
    setError("");
    setLoading(false);
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, loading]);

  // Freeze body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !visitor) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.notInterestedReason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.patch(
        `/visitor/${visitor._id}/not-interested`,
        {
          notInterestedReason: form.notInterestedReason.trim(),
          followUpDate: form.followUpDate || null,
        },
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
        onClick={() => !loading && onClose?.()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#112D4E] shadow-2xl shadow-black/30 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700 bg-orange-50/80 dark:bg-orange-500/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-orange-100 dark:bg-orange-500/20 p-2.5">
              <Ban size={18} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-[#DBE2EF]">
                Mark as Not Interested
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {visitor.name}
                </span>{" "}
                will move to the "Not Interested" tab
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="p-1.5 rounded-xl hover:bg-orange-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 disabled:opacity-60 transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#DBE2EF] mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="notInterestedReason"
              value={form.notInterestedReason}
              onChange={handleChange}
              placeholder="e.g. Not interested in this course / budget issue / already enrolled elsewhere..."
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a1f3a] px-3 py-2.5 text-sm text-slate-800 dark:text-[#DBE2EF] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 dark:focus:border-orange-500 transition"
            />
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Keep it brief — this helps future reporting.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-[#DBE2EF] mb-2">
              Follow-up Date{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
              />
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                min={today}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0a1f3a] pl-9 pr-3 py-2.5 text-sm text-slate-800 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 dark:focus:border-orange-500 transition"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Set a reminder to re-engage with them later.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-[#DBE2EF] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-sm shadow-orange-600/20 disabled:opacity-60 transition active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Ban size={14} />
                  Mark Not Interested
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotInterestedModal;
