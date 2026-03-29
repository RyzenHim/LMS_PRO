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
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const Field = ({
  icon,
  label,
  value,
  iconColor = "text-[var(--lms-text)]",
  highlight = false,
}) => {
  const iconNode = icon ? icon({ size: 16, className: iconColor }) : null;

  return (
    <div
      className={`rounded-[24px] border p-4 ${
        highlight
          ? "border-amber-200/80 bg-amber-50/70 dark:border-amber-700/40 dark:bg-amber-900/10"
          : "neu-inset"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="neu-panel-soft mt-0.5 shrink-0 rounded-2xl p-2">
          {iconNode}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-medium leading-snug text-[var(--lms-text)]">
            {value || (
              <span className="font-normal text-[var(--lms-text-soft)]">—</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

const STATUS_CONFIG = {
  new: {
    cls: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600",
  },
  contacted: {
    cls: "bg-[var(--lms-accent-soft)] text-[var(--lms-accent-strong)] border-[rgba(95,126,207,0.22)]",
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
    cls: "bg-[var(--lms-accent-soft)] text-[var(--lms-accent-strong)] border-[rgba(95,126,207,0.22)]",
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
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${cls}`}
  >
    {label}
  </span>
);

const fmtDate = (dateValue, includeTime = false) => {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  return includeTime
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString("en-IN", {
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
        <div className="neu-panel-soft rounded-[28px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--lms-accent-soft)] font-bold text-[var(--lms-accent-strong)]">
                {(visitor.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--lms-text)]">
                  {visitor.name}
                </h3>
                {visitor.email ? (
                  <p className="text-sm text-[var(--lms-text-soft)]">
                    {visitor.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill label={visitor.status || "new"} cls={statusCls} />
              {visitor.source ? (
                <Pill label={visitor.source} cls={sourceCls} />
              ) : null}
              {visitor.conversionType ? (
                <Pill
                  label={`to ${visitor.conversionType}`}
                  cls="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

          {visitor.followUpDate ? (
            <Field
              icon={CalendarDays}
              label="Follow-up Date"
              value={fmtDate(visitor.followUpDate)}
              iconColor="text-amber-600 dark:text-amber-400"
              highlight
            />
          ) : null}

          {visitor.deletedAt ? (
            <Field
              icon={Trash2}
              label="Moved to Trash"
              value={fmtDate(visitor.deletedAt, true)}
              iconColor="text-red-500 dark:text-red-400"
            />
          ) : null}

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

        {visitor.note ? (
          <div className="neu-inset rounded-[26px] p-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]">
              Notes
            </p>
            <p className="text-sm leading-relaxed text-[var(--lms-text)]">
              {visitor.note}
            </p>
          </div>
        ) : null}

        {visitor.notInterestedReason ? (
          <div className="rounded-[26px] border border-orange-200 bg-orange-50/70 p-5 dark:border-orange-700/40 dark:bg-orange-900/10">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle
                size={14}
                className="text-orange-600 dark:text-orange-400"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
                Not Interested Reason
              </p>
            </div>
            <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-200">
              {visitor.notInterestedReason}
            </p>
          </div>
        ) : null}

        {visitor.status === "converted" && visitor.conversionType ? (
          <div className="rounded-[26px] border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-700/40 dark:bg-emerald-900/10">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp
                size={14}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                Conversion
              </p>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Converted to{" "}
              <span className="font-bold capitalize">
                {visitor.conversionType}
              </span>
              {visitor.convertedToId ? (
                <span className="ml-1 font-mono text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  (ID: {String(visitor.convertedToId).slice(-8)})
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="neu-button neu-button-primary rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default ViewVisitorModal;
