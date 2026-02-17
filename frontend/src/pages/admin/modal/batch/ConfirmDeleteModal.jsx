import React from "react";
import { Trash2, X } from "lucide-react";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Confirm Delete
              </h2>
              <p className="mt-1 text-sm text-white/60">
                This action will move{" "}
                <span className="font-semibold text-white">
                  {title || "this item"}
                </span>{" "}
                to Trash.
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 hover:bg-white/10 transition"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
