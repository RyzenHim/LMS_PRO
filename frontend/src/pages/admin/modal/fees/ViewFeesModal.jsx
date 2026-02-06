import React from "react";
import { X } from "lucide-react";

const ViewFeesModal = ({ open, onClose, fees }) => {
  if (!open || !fees) return null;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Fees Details
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Student fees and due info
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
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Student
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {fees.student?.name || "—"}
              </p>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                {fees.student?.email || "—"} • {fees.student?.phone || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Course
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {fees.course?.title || "—"}
              </p>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Price: ₹{fees.coursePrice || fees.course?.price || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Paid</p>
              <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                ₹{fees.amountPaid || 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Remaining
              </p>
              <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                ₹{fees.remainingAmount || 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Due Date
              </p>
              <p className="font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                {formatDate(fees.dueDate)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Payment Type
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                {fees.paymentType || "—"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Payment Mode
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                {fees.paymentMode || "—"}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Status</p>
            <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF] capitalize">
              {fees.status || "—"}
            </p>
          </div>

          {fees.note && (
            <div className="p-4 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Note</p>
              <p className="text-[#112D4E] dark:text-[#DBE2EF]">{fees.note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewFeesModal;
