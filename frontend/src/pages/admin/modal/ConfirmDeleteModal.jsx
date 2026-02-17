import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

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
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#112D4E] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[#DBE2EF] dark:border-slate-700 bg-gradient-to-r from-red-50 to-white dark:from-red-500/10 dark:to-slate-900">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-100 dark:bg-red-500/20 p-2">
              <AlertTriangle className="text-red-600 dark:text-red-300" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Confirm Delete
              </h2>
              <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-[#DBE2EF] dark:hover:bg-slate-800 text-[#3F72AF] dark:text-[#DBE2EF] disabled:opacity-60"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm leading-relaxed text-[#112D4E] dark:text-[#DBE2EF]">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600 dark:text-red-300">
              {title}
            </span>
            ?
          </p>

          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 p-3">
            <p className="text-xs text-red-700 dark:text-red-200">
              Deleting will permanently remove this item from the system.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-900/40">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-slate-800 disabled:opacity-60 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md disabled:opacity-60 transition"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
