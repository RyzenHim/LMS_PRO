import React, { useState } from "react";

const AddCourseModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    category: "",
    tutor: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit?.(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Add Course</h2>

        <div className="space-y-4">
          <input
            name="title"
            placeholder="Course title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            name="tutor"
            placeholder="Tutor name"
            value={form.tutor}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCourseModal;
