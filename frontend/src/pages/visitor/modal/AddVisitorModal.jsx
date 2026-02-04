import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { courseService } from "../../../services/courseService";

const AddVisitorModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    course: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll();
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.phone && !/^\d{10,}$/.test(form.phone)) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    if (!form.course) {
      setError("Please select a course");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/visitor/add", form);

      if (res?.data) {
        onSuccess(res.data);
        onClose();
        setForm({
          name: "",
          email: "",
          phone: "",
          source: "other",
          course: "",
          note: "",
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-lg rounded-xl shadow-2xl p-6 my-8 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Add Visitor
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Full Name *
            </label>
            <input
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Enter phone number (min 10 digits)"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Source
            </label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              <option value="call">Call</option>
              <option value="walk-in">Walk-in</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Course *
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              required
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course._id} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Notes
            </label>
            <textarea
              name="note"
              placeholder="Counselor notes"
              value={form.note}
              onChange={handleChange}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DBE2EF] dark:border-[#3F72AF] rounded-lg text-[#3F72AF] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-[#3F72AF] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Add Visitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisitorModal;
