import React, { useState, useEffect } from "react";

const EditTutorModal = ({ open, onClose, tutor, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    expertise: "",
    experience: "",
    qualification: "",
    bio: "",
    salary: "",
  });

  useEffect(() => {
    if (tutor) {
      setForm({
        name: tutor.name || "",
        email: tutor.email || "",
        phone: tutor.phone || "",
        expertise: tutor.expertise || "",
        experience: tutor.experience || "",
        qualification: tutor.qualification || "",
        bio: tutor.bio || "",
        salary: tutor.salary || "",
      });
    }
  }, [tutor]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl my-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Tutor
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Tutor name"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tutor@example.com"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Expertise *
              </label>
              <input
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                placeholder="e.g., React, Node.js"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Experience (years)
              </label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Qualification
              </label>
              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g., M.Tech, B.E."
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Salary
              </label>
              <input
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Brief bio about the tutor"
                rows="3"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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

