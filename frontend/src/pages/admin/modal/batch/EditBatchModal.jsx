import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { courseService } from "../../../../services/courseService";
import { tutorService } from "../../../../services/tutorService";

const EditBatchModal = ({ open, onClose, batch, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCourses();
      fetchTutors();
    }
  }, [open]);

  useEffect(() => {
    if (batch) {
      setForm({
        name: batch.name || "",
        course: batch.course?._id || batch.course || "",
        tutor: batch.tutor?._id || batch.tutor || "",
        startDate: batch.startDate ? batch.startDate.slice(0, 10) : "",
        endDate: batch.endDate ? batch.endDate.slice(0, 10) : "",
        status: batch.status || "upcoming",
      });
    }
  }, [batch]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll();
      setCourses(res.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchTutors = async () => {
    try {
      const res = await tutorService.getAll();
      setTutors(res.data || []);
    } catch (error) {
      console.error("Failed to fetch tutors", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form?.name || !form?.course || !form?.tutor || !form?.startDate) {
      return alert("Please fill all required fields");
    }

    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
            Edit Batch
          </h2>
          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Batch Name */}
          <div>
            <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              Batch Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
            />
          </div>

          {/* Course */}
          <div>
            <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              Course *
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tutor */}
          <div>
            <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              Tutor *
            </label>
            <select
              name="tutor"
              value={form.tutor}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
            >
              <option value="">Select tutor</option>
              {tutors.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF] outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBatchModal;
