import React, { useEffect, useState } from "react";

const Admin_EditEmployeeModal = ({ open, onClose, employee, onSubmit }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (employee && open) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department || "",
        designation: employee.designation || "admin",
        salary: employee.salary || "",
      });
    }
  }, [employee, open]);

  if (!open || !form) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      designation: form.designation,
      salary: Number(form.salary || 0),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] rounded-xl p-6 w-full max-w-lg border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-4">
          Edit Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            placeholder="Full Name"
            required
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            placeholder="Email"
            required
          />

          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            placeholder="Department"
          />

          <select
            name="designation"
            value={form.designation}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
          >
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="teacher">Teacher</option>
          </select>

          <input
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            placeholder="Salary"
            min="0"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg dark:border-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#3F72AF] text-white px-4 py-2 rounded-lg hover:bg-[#112D4E]"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin_EditEmployeeModal;
