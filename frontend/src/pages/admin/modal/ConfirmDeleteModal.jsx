import { useEffect } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = "this item",
  loading = false,
}) => {
  // ESC to close
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
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop — blur + dim */}
      <div
        onClick={() => !loading && onClose?.()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#112D4E] shadow-2xl shadow-black/30 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700 bg-red-50/80 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-100 dark:bg-red-500/20 p-2.5">
              <AlertTriangle
                size={18}
                className="text-red-600 dark:text-red-400"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-[#DBE2EF]">
                Move to Trash
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                You can restore this from the Trash tab
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60 transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-[#DBE2EF]">
            Move{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {title}
            </span>{" "}
            to trash?
          </p>
          <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              This visitor will be moved to the Trash tab and hidden from all
              other views. You can restore it at any time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-[#DBE2EF] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm shadow-red-600/20 disabled:opacity-60 transition active:scale-95"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
};

export default ConfirmDeleteModal;
