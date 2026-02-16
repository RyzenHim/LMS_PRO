import React from "react";

const ViewEmployeeModal = ({ open, onClose, employee }) => {
  if (!open || !employee) return null;

  const safeDate = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#112D4E] rounded-2xl p-6 w-full max-w-2xl border border-[#DBE2EF] dark:border-[#3F72AF] shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Employee Details
            </h2>
            <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              View employee profile information
            </p>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Name</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Email</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Phone</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.phone || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Department</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.department || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Designation</p>
            <p className="text-[#112D4E] dark:text-white font-medium capitalize">
              {employee.designation || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Salary</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              ₹{Number(employee.salary || 0)}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Status</p>
            <span
              className={`inline-flex px-2 py-1 text-xs rounded-md font-medium ${
                employee.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Joining Date</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.joiningDate
                ? new Date(employee.joiningDate).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Created</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {safeDate(employee.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Updated</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {safeDate(employee.updatedAt)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white hover:bg-[#112D4E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
