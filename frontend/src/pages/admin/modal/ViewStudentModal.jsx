import React from "react";

const ViewStudentModal = ({ open, onClose, student }) => {
  if (!open || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
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
              <p className="text-gray-900 dark:text-white">{student.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{student.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Phone
              </label>
              <p className="text-gray-900 dark:text-white">{student.phone || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Course
              </label>
              <p className="text-gray-900 dark:text-white">{student.course}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{student.status}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Date of Birth
              </label>
              <p className="text-gray-900 dark:text-white">
                {student.dateOfBirth
                  ? new Date(student.dateOfBirth).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Enrollment Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {student.enrollmentDate
                  ? new Date(student.enrollmentDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Is Active
              </label>
              <p className="text-gray-900 dark:text-white">
                {student.isActive ? "Yes" : "No"}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Address
              </label>
              <p className="text-gray-900 dark:text-white">{student.address || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Guardian Name
              </label>
              <p className="text-gray-900 dark:text-white">{student.guardianName || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Guardian Phone
              </label>
              <p className="text-gray-900 dark:text-white">{student.guardianPhone || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(student.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(student.updatedAt).toLocaleString()}
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

export default ViewStudentModal;

