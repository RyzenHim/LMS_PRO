import React from "react";
import ModalShell from "../../../components/ui/ModalShell";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Tag,
  Clock,
  Info,
  Trash2,
} from "lucide-react";

const Field = ({ icon: Icon, label, value, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl bg-[#DBE2EF] dark:bg-slate-700 p-2">
          <Icon size={18} className="text-[#112D4E] dark:text-[#DBE2EF]" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3F72AF] dark:text-slate-300">
            {label}
          </p>

          <p className="mt-1 text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] break-words">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

const ViewVisitorModal = ({ open, onClose, visitor }) => {
  if (!open || !visitor) return null;

  const courseName =
    typeof visitor.course === "object"
      ? visitor.course?.title || "—"
      : visitor.course || "—";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Visitor Details"
      subtitle="Read-only visitor information"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* TOP SUMMARY */}
        <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-gradient-to-r from-[#DBE2EF]/70 to-white dark:from-slate-800/70 dark:to-slate-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3F72AF] dark:text-slate-300">
            Visitor
          </p>

          <h3 className="mt-1 text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            {visitor.name || "—"}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF] border border-[#DBE2EF] dark:border-slate-700">
              Status:{" "}
              <span className="ml-1 capitalize">{visitor.status || "new"}</span>
            </span>

            <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF] border border-[#DBE2EF] dark:border-slate-700">
              Source:{" "}
              <span className="ml-1 capitalize">{visitor.source || "—"}</span>
            </span>

            {visitor.conversionType && (
              <span className="inline-flex items-center rounded-full bg-white/80 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-[#112D4E] dark:text-[#DBE2EF] border border-[#DBE2EF] dark:border-slate-700">
                Converted:{" "}
                <span className="ml-1 capitalize">
                  {visitor.conversionType}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field icon={User} label="Name" value={visitor.name} />
          <Field icon={Mail} label="Email" value={visitor.email} />
          <Field icon={Phone} label="Phone" value={visitor.phone} />
          <Field icon={BookOpen} label="Course" value={courseName} />
          <Field icon={Tag} label="Source" value={visitor.source} />
          <Field icon={Info} label="Status" value={visitor.status} />

          {visitor.followUpDate && (
            <Field
              icon={Clock}
              label="Follow-up Date"
              value={new Date(visitor.followUpDate).toLocaleDateString()}
            />
          )}

          {visitor.deletedAt && (
            <Field
              icon={Trash2}
              label="Deleted At"
              value={new Date(visitor.deletedAt).toLocaleString()}
            />
          )}

          <Field
            icon={Clock}
            label="Created At"
            value={
              visitor.createdAt
                ? new Date(visitor.createdAt).toLocaleString()
                : "—"
            }
          />

          <Field
            icon={Clock}
            label="Updated At"
            value={
              visitor.updatedAt
                ? new Date(visitor.updatedAt).toLocaleString()
                : "—"
            }
          />

          <Field
            icon={Trash2}
            label="Is Deleted"
            value={visitor.isDeleted ? "Yes" : "No"}
          />
        </div>

        {/* NOTE */}
        <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3F72AF] dark:text-slate-300">
            Note
          </p>
          <p className="mt-2 text-sm text-[#112D4E] dark:text-[#DBE2EF] leading-relaxed">
            {visitor.note || "—"}
          </p>
        </div>

        {/* EXTRA SECTIONS */}
        {visitor.notInterestedReason && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">
              Not Interested Reason
            </p>
            <p className="mt-2 text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
              {visitor.notInterestedReason}
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewVisitorModal;
