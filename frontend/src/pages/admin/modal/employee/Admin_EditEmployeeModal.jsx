import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const Admin_EditEmployeeModal = ({ open, onClose, employee, onSubmit }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (employee && open) {
      setForm({
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "admin",
        salary: employee.salary ?? "",
      });
    }
  }, [employee, open]);

  const handleClose = () => {
    setForm(null);
    onClose?.();
  };

  if (!open || !form) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ============================
    // ✅ backend required fields
    // ============================
    if (!form.name.trim()) return alert("Name is required");
    if (!form.department.trim()) return alert("Department is required");
    if (!form.designation.trim()) return alert("Designation is required");

    if (form.salary === "" || Number(form.salary) <= 0) {
      return alert("Salary is required and must be greater than 0");
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      department: form.department.trim(),
      designation: form.designation,
      salary: Number(form.salary),
    };

    onSubmit?.(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-[#112D4E] rounded-2xl p-6 w-full max-w-lg border border-[#DBE2EF] dark:border-[#3F72AF] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Edit Employee
          </h2>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[#DBE2EF] dark:hover:bg-[#0a1f3a] transition"
          >
            <X size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
          </button>
        </div>

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
              placeholder="Full Name"
              required
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Email (Optional)
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Phone (Optional)
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Department *
            </label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              required
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
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
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            >
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Salary *
            </label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Salary"
              min="0"
              required
              className="w-full mt-1 border rounded-xl px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="border px-4 py-2 rounded-xl dark:border-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#3F72AF] text-white px-4 py-2 rounded-xl hover:bg-[#112D4E]"
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
