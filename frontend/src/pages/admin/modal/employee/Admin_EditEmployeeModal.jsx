import React, { useEffect, useState } from "react";

const Admin_EditEmployeeModal = ({ open, onClose, employee, onSubmit }) => {
  const [form, setForm] = useState(null);

  /* ----------------------------------
     Sync employee → form
  ---------------------------------- */
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

  /* ----------------------------------
     Handle input change
  ---------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ----------------------------------
     Submit
  ---------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    // send ONLY fields controller allows
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department.trim(),
      designation: form.designation,
      salary: Number(form.salary),
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Full Name"
            required
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Email"
            required
          />

          {/* Department */}
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Department"
          />

          {/* Designation */}
          <select
            name="designation"
            value={form.designation}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
          </select>

          {/* Salary */}
          <input
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Salary"
            min="0"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
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
