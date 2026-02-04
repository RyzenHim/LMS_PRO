import React from "react";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, title }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
        <div className="p-6 space-y-3">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Confirm Delete
          </h2>
          <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
            Are you sure you want to delete{" "}
            <span className="font-medium text-[#112D4E] dark:text-white">
              {title || "this item"}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
