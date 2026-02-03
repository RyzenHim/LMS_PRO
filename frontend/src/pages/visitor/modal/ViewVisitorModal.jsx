import React from "react";

const ViewVisitorModal = ({ open, onClose, visitor }) => {
  if (!open || !visitor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Visitor Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Name
              </label>
              <p className="text-gray-900 dark:text-white">{visitor.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{visitor.email || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Phone
              </label>
              <p className="text-gray-900 dark:text-white">{visitor.phone || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Course
              </label>
              <p className="text-gray-900 dark:text-white">{visitor.course || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Source
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{visitor.source || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{visitor.status || "—"}</p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Note
              </label>
              <p className="text-gray-900 dark:text-white">{visitor.note || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(visitor.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(visitor.updatedAt).toLocaleString()}
              </p>
            </div>

            {visitor.deletedAt && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Deleted At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(visitor.deletedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Is Deleted
              </label>
              <p className="text-gray-900 dark:text-white">
                {visitor.isDeleted ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitorModal;
