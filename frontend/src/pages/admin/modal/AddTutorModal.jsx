import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { employeeService } from "../../../services/employeeService"; // ✅ you must have this

const AddTutorModal = ({ open, onClose, onSubmit }) => {
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    employee: "",
    expertise: "",
    experience: "",
    qualification: "",
    bio: "",
  });

  useEffect(() => {
    if (!open) return;

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await employeeService.getAll({
          page: 1,
          limit: 200,
        });

        setEmployees(res.data.employees || []);
      } catch (err) {
        console.error("Fetch employees failed", err);
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      employee: "",
      expertise: "",
      experience: "",
      qualification: "",
      bio: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.employee || !form.expertise) {
      alert("Employee and expertise are required");
      return;
    }

    onSubmit?.({
      employee: form.employee,
      expertise: form.expertise,
      experience: Number(form.experience || 0),
      qualification: form.qualification,
      bio: form.bio,
    });

    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl shadow-xl border dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Tutor
          </h2>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Employee *
            </label>

            <select
              name="employee"
              value={form.employee}
              onChange={handleChange}
              required
              className="w-full mt-1 px-3 py-2 border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">
                {loadingEmployees ? "Loading employees..." : "Select employee"}
              </option>

              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          {/* Tutor Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expertise *
              </label>
              <input
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                placeholder="e.g., React, Node.js"
                required
                className="w-full mt-1 px-3 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience (years)
              </label>
              <input
                name="experience"
                type="number"
                value={form.experience}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full mt-1 px-3 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Qualification
              </label>
              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="e.g., M.Tech, B.E."
                className="w-full mt-1 px-3 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Brief bio about the tutor"
                rows={4}
                className="w-full mt-1 px-3 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded-xl dark:border-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors"
            >
              Add Tutor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTutorModal;
