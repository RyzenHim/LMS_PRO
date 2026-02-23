import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axios";
import { courseService } from "../../../services/courseService";
import ModalShell from "../../../components/ui/ModalShell";
import { AlertCircle, Loader2, CalendarDays } from "lucide-react";

const EditVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "other",
    course: "",
    note: "",
    status: "new",
    followUpDate: "",
    notInterestedReason: "",
  });

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  // Fetch courses when modal opens
  useEffect(() => {
    if (!open) return;
    const fetchCourses = async () => {
      try {
        setDropdownLoading(true);
        const res = await courseService.getAll({ limit: 100 });
        const list = res.data?.courses || res || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch {
        // silent
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchCourses();
  }, [open]);

  // Populate form from visitor
  useEffect(() => {
    if (!open || !visitor) return;
    setError("");

    // followUpDate: stored as ISO Date string in DB, input type="date" needs YYYY-MM-DD
    const formatDate = (d) => {
      if (!d) return "";
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "";
      return dt.toISOString().split("T")[0];
    };

    setForm({
      name: visitor.name || "",
      email: visitor.email || "",
      phone: visitor.phone ? String(visitor.phone) : "", // display as string in input
      source: visitor.source || "other",
      course:
        typeof visitor.course === "object"
          ? visitor.course?._id || ""
          : visitor.course || "",
      note: visitor.note || "",
      status: visitor.status || "new",
      followUpDate: formatDate(visitor.followUpDate),
      notInterestedReason: visitor.notInterestedReason || "",
    });
  }, [open, visitor]);

  if (!open || !visitor) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    if (form.phone && !/^\d{10,}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("Phone must be at least 10 digits");
      return;
    }
    if (!form.course) {
      setError("Please select a course");
      return;
    }

    // followUpDate required when status = follow-up
    if (form.status === "follow-up" && !form.followUpDate) {
      setError("Please set a follow-up date when status is 'Follow-up'");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email?.trim() || undefined,
        // ✅ FIX: phone must be sent as Number (schema type: Number)
        phone: form.phone ? Number(form.phone.replace(/\s/g, "")) : undefined,
        source: form.source,
        course: form.course,
        note: form.note?.trim() || "",
        status: form.status,
        // Only include contextual fields when relevant
        followUpDate:
          form.status === "follow-up" ? form.followUpDate : undefined,
        notInterestedReason:
          form.status === "not-interested"
            ? form.notInterestedReason || undefined
            : undefined,
      };

      await axiosInstance.put(`/visitor/${visitor._id}`, payload);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update visitor");
    } finally {
      setLoading(false);
    }
  };

  const fieldCls =
    "mt-1.5 w-full px-3 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-[#DBE2EF] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF]/50 transition text-sm";
  const labelCls =
    "block text-sm font-semibold text-slate-700 dark:text-[#DBE2EF]";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Visitor"
      subtitle={`Updating details for ${visitor.name}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {dropdownLoading && (
          <div className="flex items-center gap-2 text-sm text-[#3F72AF] dark:text-[#7aa8d8]">
            <Loader2 size={14} className="animate-spin" /> Loading courses...
          </div>
        )}

        {/* Name */}
        <div>
          <label className={labelCls}>
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={fieldCls}
            placeholder="Enter full name"
          />
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={fieldCls}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className={fieldCls}
              placeholder="10-digit number"
            />
          </div>
        </div>

        {/* Source + Course */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Source</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className={fieldCls}
            >
              <option value="call">Call</option>
              <option value="walk-in">Walk-in</option>
              <option value="email">Email</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              required
              className={fieldCls}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={fieldCls}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="follow-up">Follow-up</option>
            <option value="not-interested">Not Interested</option>
            {/* "converted" is intentionally excluded — conversion is done via ConvertVisitorModal */}
          </select>
        </div>

        {/* Follow-up date — only shown when status = follow-up */}
        {form.status === "follow-up" && (
          <div>
            <label className={labelCls}>
              Follow-up Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`${fieldCls} pl-9`}
              />
            </div>
          </div>
        )}

        {/* Not interested reason — only shown when status = not-interested */}
        {form.status === "not-interested" && (
          <div>
            <label className={labelCls}>Not Interested Reason</label>
            <textarea
              name="notInterestedReason"
              value={form.notInterestedReason}
              onChange={handleChange}
              rows={2}
              placeholder="Brief reason..."
              className={`${fieldCls} resize-none`}
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            placeholder="Counselor notes..."
            className={`${fieldCls} resize-none`}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-[#DBE2EF] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold shadow-sm shadow-[#3F72AF]/20 disabled:opacity-60 transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
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
