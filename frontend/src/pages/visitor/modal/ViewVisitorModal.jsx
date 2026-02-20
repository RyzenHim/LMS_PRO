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
  CalendarDays,
  FileText,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

// ─── Field card defined OUTSIDE so it never remounts ─────────────────────────
const Field = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-[#112D4E] dark:text-[#DBE2EF]",
  highlight,
}) => (
  <div
    className={`rounded-2xl border p-4 ${highlight ? "border-amber-200 dark:border-amber-700/40 bg-amber-50/60 dark:bg-amber-900/10" : "border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-800/40"}`}
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-xl bg-[#DBE2EF] dark:bg-slate-700/70 p-2 shrink-0">
        <Icon size={16} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#3F72AF] dark:text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] break-words leading-snug">
          {value || (
            <span className="text-slate-400 dark:text-slate-500 font-normal">
              —
            </span>
          )}
        </p>
      </div>
    </div>
  </div>
);

// Status badge config
const STATUS_CONFIG = {
  new: {
    cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600",
  },
  contacted: {
    cls: "bg-[#3F72AF]/10 text-[#3F72AF] border-[#3F72AF]/20 dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8] dark:border-[#3F72AF]/30",
  },
  "follow-up": {
    cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
  },
  "not-interested": {
    cls: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700/50",
  },
  converted: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
  },
};

const SOURCE_CONFIG = {
  call: {
    cls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/50",
  },
  "walk-in": {
    cls: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/50",
  },
  email: {
    cls: "bg-[#3F72AF]/10 text-[#3F72AF] border-[#3F72AF]/20 dark:bg-[#3F72AF]/20 dark:text-[#7aa8d8]",
  },
  referral: {
    cls: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/50",
  },
  other: {
    cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400",
  },
};

const Pill = ({ label, cls }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${cls}`}
  >
    {label}
  </span>
);

const fmtDate = (d, includeTime = false) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return includeTime
    ? dt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : dt.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

const ViewVisitorModal = ({ open, onClose, visitor }) => {
  if (!open || !visitor) return null;

  const courseName =
    typeof visitor.course === "object"
      ? visitor.course?.title || "—"
      : visitor.course || "—";

  const statusCls = (STATUS_CONFIG[visitor.status] || STATUS_CONFIG.new).cls;
  const sourceCls = (SOURCE_CONFIG[visitor.source] || SOURCE_CONFIG.other).cls;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Visitor Details"
      subtitle="Full visitor record — read only"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* ─── Summary card ─── */}
        <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-gradient-to-br from-[#DBE2EF]/60 to-white dark:from-slate-800/70 dark:to-slate-900 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3F72AF]/15 dark:bg-[#3F72AF]/25 border border-[#3F72AF]/20 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-[#3F72AF]">
                  {(visitor.name || "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#112D4E] dark:text-white">
                  {visitor.name}
                </h3>
                {visitor.email && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {visitor.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill label={visitor.status || "new"} cls={statusCls} />
              {visitor.source && (
                <Pill label={visitor.source} cls={sourceCls} />
              )}
              {visitor.conversionType && (
                <Pill
                  label={`→ ${visitor.conversionType}`}
                  cls="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50"
                />
              )}
            </div>
          </div>
        </div>

        {/* ─── Core fields grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field icon={User} label="Full Name" value={visitor.name} />
          <Field icon={Mail} label="Email" value={visitor.email} />
          <Field
            icon={Phone}
            label="Phone"
            value={visitor.phone ? String(visitor.phone) : null}
          />
          <Field icon={BookOpen} label="Course" value={courseName} />
          <Field icon={Tag} label="Source" value={visitor.source} />
          <Field icon={Info} label="Status" value={visitor.status} />

          {visitor.followUpDate && (
            <Field
              icon={CalendarDays}
              label="Follow-up Date"
              value={fmtDate(visitor.followUpDate)}
              iconColor="text-amber-600 dark:text-amber-400"
              highlight
            />
          )}

          {visitor.deletedAt && (
            <Field
              icon={Trash2}
              label="Moved to Trash"
              value={fmtDate(visitor.deletedAt, true)}
              iconColor="text-red-500 dark:text-red-400"
            />
          )}

          <Field
            icon={Clock}
            label="Created"
            value={fmtDate(visitor.createdAt, true)}
          />
          <Field
            icon={Clock}
            label="Last Updated"
            value={fmtDate(visitor.updatedAt, true)}
          />
        </div>

        {/* ─── Note ─── */}
        {visitor.note && (
          <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#3F72AF] dark:text-slate-400 mb-2">
              Notes
            </p>
            <p className="text-sm text-[#112D4E] dark:text-[#DBE2EF] leading-relaxed">
              {visitor.note}
            </p>
          </div>
        )}

        {/* ─── Not interested reason ─── */}
        {visitor.notInterestedReason && (
          <div className="rounded-2xl border border-orange-200 dark:border-orange-700/40 bg-orange-50/70 dark:bg-orange-900/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle
                size={14}
                className="text-orange-600 dark:text-orange-400"
              />
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Not Interested Reason
              </p>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed">
              {visitor.notInterestedReason}
            </p>
          </div>
        )}

        {/* ─── Conversion info ─── */}
        {visitor.status === "converted" && visitor.conversionType && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp
                size={14}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Conversion
              </p>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Converted to{" "}
              <span className="font-bold capitalize">
                {visitor.conversionType}
              </span>
              {visitor.convertedToId && (
                <span className="ml-1 text-emerald-600/70 dark:text-emerald-400/70 text-xs font-mono">
                  (ID: {String(visitor.convertedToId).slice(-8)})
                </span>
              )}
            </p>
          </div>
        )}

        {/* ─── Close button ─── */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold shadow-sm shadow-[#3F72AF]/20 transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewVisitorModal;
