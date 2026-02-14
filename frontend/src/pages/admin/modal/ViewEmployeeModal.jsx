import React from "react";

const ViewEmployeeModal = ({ open, onClose, employee }) => {
  if (!open || !employee) return null;

  const safeDate = (d) => (d ? new Date(d).toLocaleString() : "—");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-2xl border border-[#DBE2EF] dark:border-[#3F72AF]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Employee Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF]"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
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
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Department</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.department || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF]">Designation</p>
            <p className="text-[#112D4E] dark:text-white font-medium">
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
            <p className="text-[#112D4E] dark:text-white font-medium">
              {employee.isActive ? "Active" : "Inactive"}
            </p>
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

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
