import React, { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

const EditTutorModal = ({ open, onClose, tutor, onSubmit }) => {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // employee fields
    name: "",
    email: "",
    phone: "",
    salary: "",
    department: "",
    designation: "teacher",

    // tutor fields
    expertise: "",
    experience: "",
    qualification: "",
    bio: "",
  });

  useEffect(() => {
    if (!open) return;

    if (tutor) {
      const emp = tutor.employee || {};

      setForm({
        name: emp.name || "",
        email: emp.email || "",
        phone: emp.phone || "",
        salary: emp.salary ?? "",
        department: emp.department || "",
        designation: emp.designation || "teacher",

        expertise: tutor.expertise || "",
        experience:
          tutor.experience === 0 || tutor.experience
            ? String(tutor.experience)
            : "",
        qualification: tutor.qualification || "",
        bio: tutor.bio || "",
      });
    }
  }, [open, tutor]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tutor?._id) return;

    const payload = {
      // 👇 employee update
      employeeUpdate: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        salary: Number(form.salary || 0),
        department: form.department.trim(),
        designation: "teacher", // force teacher
      },

      // 👇 tutor update
      tutorUpdate: {
        expertise: form.expertise.trim(),
        experience: Number(form.experience || 0),
        qualification: form.qualification.trim(),
        bio: form.bio.trim(),
      },
    };

    try {
      setSaving(true);
      await onSubmit?.(payload);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    if (saving) return;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#112D4E] rounded-2xl w-full max-w-3xl border border-[#DBE2EF] dark:border-[#3F72AF] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Edit Tutor
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Update Employee + Tutor profile (email cannot be changed)
            </p>
          </div>

          <button
            onClick={closeModal}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-[#DBE2EF]/50 dark:hover:bg-[#0a1f3a] disabled:opacity-50"
          >
            <X size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Details */}
          <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
              Employee Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Email (read only) */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Email (cannot change)
                </label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-[#0a1f3a]/50 dark:text-[#DBE2EF] dark:border-[#3F72AF] cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="e.g., 9876543210"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Salary
                </label>
                <input
                  name="salary"
                  type="number"
                  value={form.salary}
                  onChange={handleChange}
                  disabled={saving}
                  min="0"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Department */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Department
                </label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Designation (read-only) */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Designation
                </label>
                <input
                  value="teacher"
                  disabled
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-gray-100 dark:bg-[#0a1f3a]/50 dark:text-[#DBE2EF] dark:border-[#3F72AF] cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Tutor Details */}
          <div className="border border-[#DBE2EF] dark:border-[#3F72AF] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
              Tutor Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expertise */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Expertise *
                </label>
                <input
                  name="expertise"
                  value={form.expertise}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Experience (years)
                </label>
                <input
                  name="experience"
                  type="number"
                  value={form.experience}
                  onChange={handleChange}
                  disabled={saving}
                  min="0"
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Qualification */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Qualification
                </label>
                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={saving}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={saving}
              className="px-4 py-2 rounded-lg border dark:border-[#3F72AF] dark:text-[#DBE2EF] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Updating..." : "Update Tutor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTutorModal;
