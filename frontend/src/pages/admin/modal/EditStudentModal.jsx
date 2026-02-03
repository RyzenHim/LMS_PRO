import React, { useState, useEffect } from "react";

const EditStudentModal = ({ open, onClose, student, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    address: "",
    dateOfBirth: "",
    guardianName: "",
    guardianPhone: "",
    status: "active",
  });

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        course: student.course || "",
        address: student.address || "",
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        status: student.status || "active",
      });
    }
  }, [student]);

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
          Edit Student
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
                placeholder="Student name"
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
                placeholder="student@example.com"
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
                Course *
              </label>
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Course name"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                rows="2"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Guardian Name
              </label>
              <input
                name="guardianName"
                value={form.guardianName}
                onChange={handleChange}
                placeholder="Guardian name"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Guardian Phone
              </label>
              <input
                name="guardianPhone"
                value={form.guardianPhone}
                onChange={handleChange}
                placeholder="Guardian phone"
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
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;

