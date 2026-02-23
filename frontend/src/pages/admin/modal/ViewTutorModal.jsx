import { X } from "lucide-react";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium text-[#3F72AF] dark:text-slate-400 mb-0.5">
      {label}
    </p>
    <p className="text-sm text-[#112D4E] dark:text-slate-100">{value || "—"}</p>
  </div>
);

const ViewTutorModal = ({ open, onClose, tutor }) => {
  if (!open || !tutor) return null;
  const emp = tutor.employee || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Blur backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#101010] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#DBE2EF] dark:border-slate-800 bg-white dark:bg-[#101010]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3F72AF]/20 dark:bg-[#3F72AF]/30 flex items-center justify-center text-sm font-bold text-[#3F72AF] uppercase">
              {(emp.name || "T").charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#112D4E] dark:text-slate-100">
                {emp.name || "Tutor"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {emp.email || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Employee section */}
          <div className="rounded-xl border border-[#DBE2EF] dark:border-slate-800 p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Employee Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={emp.name} />
              <Field label="Email" value={emp.email} />
              <Field label="Phone" value={emp.phone} />
              <Field label="Department" value={emp.department} />
              <Field label="Designation" value={emp.designation} />
              <Field
                label="Salary"
                value={
                  emp.salary ? `₹${Number(emp.salary).toLocaleString()}` : null
                }
              />
              <Field
                label="Joining Date"
                value={
                  emp.joiningDate
                    ? new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : null
                }
              />
              <Field
                label="Employee Active"
                value={emp.isActive ? "Yes" : "No"}
              />
            </div>
          </div>

          {/* Tutor section */}
          <div className="rounded-xl border border-[#DBE2EF] dark:border-slate-800 p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tutor Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expertise" value={tutor.expertise} />
              <Field
                label="Experience"
                value={
                  tutor.experience !== undefined
                    ? `${tutor.experience} years`
                    : null
                }
              />
              <Field label="Qualification" value={tutor.qualification} />
              <div>
                <p className="text-xs font-medium text-[#3F72AF] dark:text-slate-400 mb-0.5">
                  Is Active
                </p>
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${tutor.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400"}`}
                >
                  {tutor.isActive ? "Yes" : "No"}
                </span>
              </div>
              {tutor.bio && (
                <div className="col-span-2">
                  <Field label="Bio" value={tutor.bio} />
                </div>
              )}
              <Field
                label="Created"
                value={
                  tutor.createdAt
                    ? new Date(tutor.createdAt).toLocaleString()
                    : null
                }
              />
              <Field
                label="Updated"
                value={
                  tutor.updatedAt
                    ? new Date(tutor.updatedAt).toLocaleString()
                    : null
                }
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTutorModal;
