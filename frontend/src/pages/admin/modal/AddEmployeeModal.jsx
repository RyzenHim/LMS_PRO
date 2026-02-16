import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const AddEmployeeModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "admin",
    department: "management",
    salary: "",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        email: "",
        phone: "",
        designation: "admin",
        department: "management",
        salary: "",
      });
    }
  }, [open]);

  // auto department
  useEffect(() => {
    if (!open) return;

    if (form.designation === "hr") {
      setForm((prev) => ({ ...prev, department: "hr" }));
    }

    if (form.designation === "teacher") {
      setForm((prev) => ({ ...prev, department: "teaching" }));
    }

    if (form.designation === "admin") {
      setForm((prev) => ({ ...prev, department: "management" }));
    }
  }, [form.designation, open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ============================
    // ✅ Backend required fields
    // ============================
    if (!form.name.trim()) return alert("Name is required");
    if (!form.department.trim()) return alert("Department is required");
    if (!form.designation.trim()) return alert("Designation is required");
    if (form.salary === "" || Number(form.salary) <= 0) {
      return alert("Salary is required and must be greater than 0");
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || "",
      phone: form.phone.trim() || "",
      designation: form.designation,
      department: form.department.trim(),
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
            Add Employee
          </h2>

          <button
            onClick={onClose}
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
              placeholder="Employee name"
              required
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Email (Login will be created)
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@lms.com"
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Phone
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10 digit number"
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
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
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            >
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="teacher">Teacher</option>
            </select>
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
              placeholder="management / hr / teaching"
              required
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-[#3F72AF] dark:text-[#DBE2EF]">
              Salary (Monthly) *
            </label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Monthly salary"
              min="0"
              required
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] dark:border-[#3F72AF]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl dark:border-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-[#3F72AF] text-white rounded-xl hover:bg-[#112D4E]"
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
