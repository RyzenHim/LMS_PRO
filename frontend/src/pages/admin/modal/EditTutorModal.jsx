import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const inputCls =
  "w-full mt-1.5 px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed";

const EditTutorModal = ({ open, onClose, tutor, onSubmit }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // employee fields
    name: "",
    phone: "",
    salary: "",
    department: "",
    // tutor fields
    expertise: "",
    experience: "",
    qualification: "",
    bio: "",
  });

  useEffect(() => {
    if (!open || !tutor) return;
    const emp = tutor.employee || {};
    setForm({
      name: emp.name || "",
      phone: emp.phone || "",
      salary: emp.salary ?? "",
      department: emp.department || "",
      expertise: tutor.expertise || "",
      experience:
        tutor.experience !== undefined ? String(tutor.experience) : "",
      qualification: tutor.qualification || "",
      bio: tutor.bio || "",
    });
  }, [open, tutor]);

  if (!open) return null;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Send two separate payloads — AdminTutors.handleUpdateTutor expects this shape
      await onSubmit?.({
        tutorUpdate: {
          expertise: form.expertise.trim(),
          experience: Number(form.experience || 0),
          qualification: form.qualification.trim(),
          bio: form.bio.trim(),
        },
        employeeUpdate: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          salary: Number(form.salary || 0),
          department: form.department.trim(),
          designation: "teacher",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Blur backdrop */}
      <div
        onClick={() => !saving && onClose?.()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#101010] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[#DBE2EF] dark:border-slate-800 bg-white dark:bg-[#101010]">
          <div>
            <h2 className="text-base font-bold text-[#112D4E] dark:text-slate-100">
              Edit Tutor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Email cannot be changed
            </p>
          </div>
          <button
            onClick={() => !saving && onClose?.()}
            disabled={saving}
            className="p-1.5 rounded-xl hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-50 transition"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Employee section */}
          <div className="rounded-xl border border-[#DBE2EF] dark:border-slate-800 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-slate-200">
              Employee Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  required
                  disabled={saving}
                  placeholder="Full name"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Email (read-only)
                </label>
                <input
                  value={tutor?.employee?.email || ""}
                  disabled
                  className={`${inputCls} bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={set("phone")}
                  disabled={saving}
                  placeholder="9876543210"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Salary
                </label>
                <input
                  type="number"
                  value={form.salary}
                  onChange={set("salary")}
                  disabled={saving}
                  min="0"
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Department
                </label>
                <input
                  value={form.department}
                  onChange={set("department")}
                  disabled={saving}
                  placeholder="e.g. Engineering"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Designation
                </label>
                <input
                  value="teacher"
                  disabled
                  className={`${inputCls} bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed`}
                />
              </div>
            </div>
          </div>

          {/* Tutor section */}
          <div className="rounded-xl border border-[#DBE2EF] dark:border-slate-800 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-slate-200">
              Tutor Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Expertise *
                </label>
                <input
                  value={form.expertise}
                  onChange={set("expertise")}
                  required
                  disabled={saving}
                  placeholder="e.g. React, Python"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Experience (years)
                </label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={set("experience")}
                  disabled={saving}
                  min="0"
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Qualification
                </label>
                <input
                  value={form.qualification}
                  onChange={set("qualification")}
                  disabled={saving}
                  placeholder="e.g. B.Tech, MCA"
                  className={inputCls}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={set("bio")}
                  disabled={saving}
                  rows={3}
                  placeholder="Short bio..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => !saving && onClose?.()}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold disabled:opacity-70 transition"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Updating..." : "Update Tutor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTutorModal;
