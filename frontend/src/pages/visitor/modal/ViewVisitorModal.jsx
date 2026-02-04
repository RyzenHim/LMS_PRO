import React from "react";

const ViewVisitorModal = ({ open, onClose, visitor }) => {
  if (!open || !visitor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-2xl my-8 border border-[#DBE2EF] dark:border-[#3F72AF] shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Visitor Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Name
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Email
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.email || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Phone
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.phone || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Course
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.course || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Source
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF] capitalize">{visitor.source || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Status
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF] capitalize">{visitor.status || "—"}</p>
            </div>

            {visitor.conversionType && (
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Converted To
                </label>
                <p className="text-[#3F72AF] dark:text-[#DBE2EF] capitalize">{visitor.conversionType}</p>
              </div>
            )}

            {visitor.notInterestedReason && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Not Interested Reason
                </label>
                <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.notInterestedReason}</p>
              </div>
            )}

            {visitor.followUpDate && (
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Follow-up Date
                </label>
                <p className="text-[#3F72AF] dark:text-[#DBE2EF]">
                  {new Date(visitor.followUpDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="col-span-2">
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Note
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">{visitor.note || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Created At
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">
                {new Date(visitor.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Updated At
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">
                {new Date(visitor.updatedAt).toLocaleString()}
              </p>
            </div>

            {visitor.deletedAt && (
              <div>
                <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                  Deleted At
                </label>
                <p className="text-[#3F72AF] dark:text-[#DBE2EF]">
                  {new Date(visitor.deletedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Is Deleted
              </label>
              <p className="text-[#3F72AF] dark:text-[#DBE2EF]">
                {visitor.isDeleted ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF] rounded-lg hover:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVisitorModal;
