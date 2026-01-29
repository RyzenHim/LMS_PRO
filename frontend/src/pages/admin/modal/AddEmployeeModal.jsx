import React, { useState } from "react";

const AddEmployeeModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "admin",
    department: "",
    salary: "",
  });

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
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add Employee
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Employee name"
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@lms.com"
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-600">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Department
            </label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="HR / Management"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="text-sm font-medium text-gray-600">Salary</label>
            <input
              name="salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              placeholder="Monthly salary"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
