import React, { useState, useEffect } from "react";

const EditTutorModal = ({ open, onClose, tutor, onSubmit }) => {
  const [form, setForm] = useState({
    expertise: "",
    experience: "",
    qualification: "",
    bio: "",
  });

  useEffect(() => {
    if (open && tutor) {
      setForm({
        expertise: tutor.expertise || "",
        experience: tutor.experience ?? "",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      expertise: form.expertise.trim(),
      experience: Number(form.experience || 0),
      qualification: form.qualification.trim(),
      bio: form.bio.trim(),
    };

    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-2xl my-8 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
          Edit Tutor
        </h2>

        {/* Read-only Employee Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF] font-medium">
              Name
            </p>
            <p className="text-[#112D4E] dark:text-[#DBE2EF]">
              {tutor?.employee?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF] font-medium">
              Email
            </p>
            <p className="text-[#112D4E] dark:text-[#DBE2EF]">
              {tutor?.employee?.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF] font-medium">
              Phone
            </p>
            <p className="text-[#112D4E] dark:text-[#DBE2EF]">
              {tutor?.employee?.phone || "—"}
            </p>
          </div>

          <div>
            <p className="text-[#3F72AF] dark:text-[#DBE2EF] font-medium">
              Salary
            </p>
            <p className="text-[#112D4E] dark:text-[#DBE2EF]">
              ₹{Number(tutor?.employee?.salary || 0)}
            </p>
          </div>
        </div>

        {/* Editable Tutor Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Expertise *
              </label>
              <input
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                placeholder="e.g., React, Node.js"
                required
                className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Experience (years)
              </label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
                Qualification
              </label>
              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g., M.Tech, B.E."
                className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Bio
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Brief bio about the tutor"
              rows="4"
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg dark:border-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E]"
            >
              Update Tutor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTutorModal;
