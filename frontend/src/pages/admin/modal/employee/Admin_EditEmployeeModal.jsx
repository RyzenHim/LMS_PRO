import React, { useEffect, useState } from "react";

const Admin_EditEmployeeModal = ({ open, onClose, employee, onSubmit }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (employee) {
      setForm({
        department: employee.department,
        designation: employee.designation,
        salary: employee.salary,
      });
    }
  }, [employee]);

  if (!open || !form) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Department"
          />

          <select
            name="designation"
            value={form.designation}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
          </select>

          <input
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Salary"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              type="button"
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Admin_EditEmployeeModal;
