import React from "react";

const ViewTutorModal = ({ open, onClose, tutor }) => {
  if (!open || !tutor) return null;

  const emp = tutor.employee || {};

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-2xl border border-[#DBE2EF] dark:border-[#3F72AF]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Tutor Details
          </h2>

          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Employee Info */}
            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Name
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.name || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Email
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.email || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Phone
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.phone || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Salary
              </label>
              <p className="text-[#112D4E] dark:text-white">
                ₹{Number(emp.salary || 0)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Department
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.department || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Designation
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.designation || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Joining Date
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {emp.joiningDate
                  ? new Date(emp.joiningDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* Tutor Info */}
            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Expertise
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.expertise || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Experience
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.experience || 0} years
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Qualification
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.qualification || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Is Active
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.isActive ? "Yes" : "No"}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Bio
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.bio || "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Created At
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.createdAt
                  ? new Date(tutor.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Updated At
              </label>
              <p className="text-[#112D4E] dark:text-white">
                {tutor.updatedAt
                  ? new Date(tutor.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF] rounded-lg hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTutorModal;
