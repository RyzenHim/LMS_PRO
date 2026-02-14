import React, { useEffect, useState } from "react";

const AddEmployeeModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    designation: "admin",
    department: "",
    salary: "",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        designation: "admin",
        department: "",
        salary: "",
      });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-lg border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
          Add Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Full Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Employee name"
              required
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Email *
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@lms.com"
              required
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Designation */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Designation *
            </label>
            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            >
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Department
            </label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="HR / Management / Teaching"
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Salary
            </label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Monthly salary"
              min="0"
              className="w-full px-3 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Actions */}
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
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
