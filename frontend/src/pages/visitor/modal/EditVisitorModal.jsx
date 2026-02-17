import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { courseService } from "../../../services/courseService";
import ModalShell from "../../../components/ui/ModalShell";
import { AlertCircle, Loader2 } from "lucide-react";

const EditVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    course: "", // MUST be courseId
    note: "",
    status: "new",
  });

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (open) {
      fetchCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (visitor) {
      setForm({
        name: visitor.name || "",
        email: visitor.email || "",
        phone: visitor.phone || "",
        source: visitor.source || "other",

        // IMPORTANT: visitor.course can be object (populated) OR string (id)
        course:
          typeof visitor.course === "object"
            ? visitor.course?._id || ""
            : visitor.course || "",

        note: visitor.note || "",
        status: visitor.status || "new",
      });
    }
  }, [visitor]);

  const fetchCourses = async () => {
    try {
      setDropdownLoading(true);

      const res = await courseService.getAll({ limit: 100 });

      // service returns res.data directly
      const list = res?.courses || res || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching courses", error);
    } finally {
      setDropdownLoading(false);
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

    if (!form.course) {
      setError("Please select a course");
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
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Visitor"
      subtitle="Update visitor details, status and course."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {dropdownLoading && (
          <div className="text-sm text-[#3F72AF] dark:text-slate-300 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading courses...
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40"
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40"
              />
            </div>
          </div>

          {/* Source + Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Source
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
              >
                <option value="call">Call</option>
                <option value="walk-in">Walk-in</option>
                <option value="email">Email</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF]"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="follow-up">Follow-up</option>
              <option value="converted">Converted</option>
              <option value="not-interested">Not Interested</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Notes
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/40"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF]/60 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update Visitor"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default EditVisitorModal;
