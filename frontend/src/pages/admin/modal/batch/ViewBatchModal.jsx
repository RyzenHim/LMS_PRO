import React from "react";
import { X, Users, CalendarDays, BookOpen, User } from "lucide-react";

const ViewBatchModal = ({ open, onClose, batch }) => {
  if (!open || !batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Batch Details
          </h2>
          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* Batch Name */}
          <div className="flex items-center gap-3">
            <Users size={18} className="text-[#3F72AF]" />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Batch Name
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {batch.name || "—"}
              </p>
            </div>
          </div>

          {/* Course */}
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-[#3F72AF]" />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Course
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {batch.course?.title || batch.courseTitle || "—"}
              </p>
            </div>
          </div>

          {/* Tutor */}
          <div className="flex items-center gap-3">
            <User size={18} className="text-[#3F72AF]" />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Tutor
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {batch.tutor?.name || batch.tutorName || "—"}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-[#3F72AF]" />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Start Date
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {batch.startDate
                  ? new Date(batch.startDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-[#3F72AF]" />
            <div>
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                End Date
              </p>
              <p className="font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                {batch.endDate
                  ? new Date(batch.endDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="pt-2">
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">Status</p>
            <span
              className={`inline-block mt-1 px-2 py-1 text-xs rounded-md capitalize ${
                batch.status === "running"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : batch.status === "completed"
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {batch.status || "upcoming"}
            </span>
          </div>

          {/* isActive */}
          <div>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Is Active
            </p>
            <span
              className={`inline-block mt-1 px-2 py-1 text-xs rounded-md ${
                batch.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {batch.isActive ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBatchModal;
