import React from "react";
import { X, Trash2 } from "lucide-react";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Delete Fees Record
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              This will move record to trash
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-[#112D4E] dark:text-[#DBE2EF]">
            Are you sure you want to delete fees record for:
          </p>

          <p className="mt-2 font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            {title || "Selected Student"}
          </p>

          <p className="mt-3 text-xs text-red-600">
            You can restore it later from Trash.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
