import { useEffect, useState } from "react";
import { Ban, CalendarDays, Loader2 } from "lucide-react";
import axiosInstance from "../../../api/axios";
import ModalShell from "../../../components/ui/ModalShell";

const inputClass =
  "neu-input mt-2 w-full rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text)] placeholder:text-[var(--lms-text-soft)]";

const NotInterestedModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    notInterestedReason: "",
    followUpDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm({ notInterestedReason: "", followUpDate: "" });
    setError("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, loading]);

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
    <ModalShell
      open={open}
      onClose={() => !loading && onClose?.()}
      title="Mark as Not Interested"
      subtitle={`${visitor.name} will move to the Not Interested tab.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? <div className="lms-status-error">{error}</div> : null}

        <div className="neu-panel-soft rounded-[24px] p-4">
          <div className="flex items-start gap-3">
            <div className="neu-inset rounded-[18px] p-3">
              <Ban size={18} className="text-amber-600" />
            </div>
            <p className="text-sm text-[var(--lms-text-soft)]">
              Add a clear reason so the team can understand why this lead was
              not pursued and whether a future follow-up still makes sense.
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--lms-text)]">
            Reason
          </label>
          <textarea
            name="notInterestedReason"
            value={form.notInterestedReason}
            onChange={handleChange}
            placeholder="Budget issue, enrolled elsewhere, wrong timing..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-[var(--lms-text)]">
            Follow-up Date
          </label>
          <div className="relative">
            <CalendarDays
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lms-text-soft)]"
            />
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              min={today}
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="neu-button neu-button-primary rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
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
    </ModalShell>
  );
};

export default NotInterestedModal;
