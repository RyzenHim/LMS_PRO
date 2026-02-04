import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { courseService } from "../../../services/courseService";

const EditVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    course: "",
    note: "",
    status: "new",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (visitor) {
      setForm({
        name: visitor.name || "",
        email: visitor.email || "",
        phone: visitor.phone || "",
        source: visitor.source || "other",
        course: visitor.course || "",
        note: visitor.note || "",
        status: visitor.status || "new",
      });
    }
  }, [visitor]);

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll();
      setCourses(res.data || []);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  if (!open || !visitor) return null;

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

    try {
      setLoading(true);

      const res = await axiosInstance.put(`/visitor/${visitor._id}`, form);

      if (res?.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-lg rounded-xl shadow-2xl p-6 my-8 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Edit Visitor
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
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-[#DBE2EF] dark:border-[#3F72AF] p-2 rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow-up">Follow-up</option>
              <option value="converted">Converted</option>
              <option value="not-interested">Not Interested</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Notes
            </label>
            <textarea
              name="note"
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
              {loading ? "Updating..." : "Update Visitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVisitorModal;
