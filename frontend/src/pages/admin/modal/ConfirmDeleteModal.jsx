import React from "react";

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  title = "this item",
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#112D4E] rounded-2xl p-6 w-full max-w-md border border-[#DBE2EF] dark:border-[#3F72AF] shadow-xl">
        <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Confirm Delete
        </h2>

        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#112D4E] dark:text-white">
            {title}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-xl dark:border-[#3F72AF] dark:text-[#DBE2EF] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
