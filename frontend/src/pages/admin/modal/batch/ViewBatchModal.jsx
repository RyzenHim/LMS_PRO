import React from "react";
import {
  X,
  Users,
  CalendarDays,
  BookOpen,
  User,
  Building2,
} from "lucide-react";

const ViewBatchModal = ({ open, onClose, batch }) => {
  if (!open || !batch) return null;

  const roomText =
    typeof batch.room === "object"
      ? `${batch.room?.location || "—"} • ${batch.room?.buildingName || "—"}`
      : batch.room
        ? "Room Assigned"
        : "—";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#101010] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Batch Details</h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10 transition"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          <div className="flex items-start gap-3">
            <Users size={18} className="text-white/40 mt-0.5" />
            <div>
              <p className="text-xs text-white/50">Batch Name</p>
              <p className="font-semibold text-white">{batch.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-white/40 mt-0.5" />
            <div>
              <p className="text-xs text-white/50">Course</p>
              <p className="font-semibold text-white">
                {batch.course?.title || batch.courseTitle || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User size={18} className="text-white/40 mt-0.5" />
            <div>
              <p className="text-xs text-white/50">Tutor</p>
              <p className="font-semibold text-white">
                {batch.tutor?.name || batch.tutorName || "—"}
              </p>
            </div>
          </div>

          {/* ✅ NEW */}
          <div className="flex items-start gap-3">
            <Building2 size={18} className="text-white/40 mt-0.5" />
            <div>
              <p className="text-xs text-white/50">Room</p>
              <p className="font-semibold text-white">{roomText}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-4">
              <p className="text-xs text-white/50">Start Date</p>
              <p className="mt-1 font-semibold text-white">
                {batch.startDate
                  ? new Date(batch.startDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#141414] p-4">
              <p className="text-xs text-white/50">End Date</p>
              <p className="mt-1 font-semibold text-white">
                {batch.endDate
                  ? new Date(batch.endDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {/* Status + Active */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span
              className={`rounded-2xl px-3 py-1 text-xs font-semibold capitalize
              ${
                batch.status === "running"
                  ? "bg-green-500/10 text-green-300"
                  : batch.status === "completed"
                    ? "bg-white/10 text-white/70"
                    : "bg-yellow-500/10 text-yellow-300"
              }`}
            >
              {batch.status || "upcoming"}
            </span>

            <span
              className={`rounded-2xl px-3 py-1 text-xs font-semibold
              ${
                batch.isActive
                  ? "bg-green-500/10 text-green-300"
                  : "bg-red-500/10 text-red-300"
              }`}
            >
              {batch.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/80 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBatchModal;
