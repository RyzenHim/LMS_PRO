import { useEffect } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import ModalShell from "../../../components/ui/ModalShell";

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = "this item",
  loading = false,
}) => {
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

  return (
    <ModalShell
      open={open}
      onClose={() => !loading && onClose?.()}
      title="Move to Trash"
      subtitle="You can restore this later from the Trash tab."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="neu-inset rounded-[18px] p-3">
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <p className="pt-1 text-sm leading-relaxed text-[var(--lms-text)]">
            Move <span className="font-bold">{title}</span> to trash?
          </p>
        </div>

        <div className="lms-status-warning">
          This item will be hidden from active views, but you can restore it
          later.
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="neu-button-danger rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Moving...
              </span>
            ) : (
              <>
                <Trash2 size={14} />
                Move to Trash
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ConfirmDeleteModal;
