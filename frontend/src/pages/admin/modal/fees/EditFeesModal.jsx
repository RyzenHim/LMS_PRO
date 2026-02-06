import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { studentService } from "../../../../services/studentService";
import { courseService } from "../../../../services/courseService";
import { batchService } from "../../../../services/batchService";

const EditFeesModal = ({ open, onClose, fees, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState(null);
  const [coursePrice, setCoursePrice] = useState(0);

  useEffect(() => {
    if (open) {
      fetchStudents();
      fetchCourses();
      fetchBatches();
    }
  }, [open]);

  useEffect(() => {
    if (fees) {
      setForm({
        student: fees.student?._id || "",
        course: fees.course?._id || "",
        batch: fees.batch?._id || "",
        paymentType: fees.paymentType || "full",
        paymentMode: fees.paymentMode || "offline",
        amountPaid: fees.amountPaid || 0,
        dueDate: fees.dueDate
          ? new Date(fees.dueDate).toISOString().slice(0, 10)
          : "",
        note: fees.note || "",
        isActive: fees.isActive ?? true,
      });

      setCoursePrice(Number(fees.coursePrice || fees.course?.price || 0));
    }
  }, [fees]);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll();
      setStudents((res.data || []).filter((s) => s.isDeleted === false));
    } catch (error) {
      console.error("fetchStudents error:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll();
      setCourses((res.data || []).filter((c) => c.isDeleted === false));
    } catch (error) {
      console.error("fetchCourses error:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await batchService.getAll();
      setBatches((res.data || []).filter((b) => b.isDeleted === false));
    } catch (error) {
      console.error("fetchBatches error:", error);
    }
  };

  // update course price when course changes
  useEffect(() => {
    if (!form?.course) return;

    const c = courses.find((x) => x._id === form.course);
    const price = Number(c?.price || 0);

    setCoursePrice(price);

    if (form.paymentType === "full") {
      setForm((prev) => ({
        ...prev,
        amountPaid: price,
      }));
    }
  }, [form?.course, courses, form?.paymentType]);

  const remainingAmount = useMemo(() => {
    const total = Number(coursePrice || 0);
    const paid = Number(form?.amountPaid || 0);
    return Math.max(total - paid, 0);
  }, [coursePrice, form?.amountPaid]);

  const status = useMemo(() => {
    const total = Number(coursePrice || 0);
    const paid = Number(form?.amountPaid || 0);

    if (paid <= 0) return "unpaid";
    if (paid >= total) return "paid";
    return "partial";
  }, [coursePrice, form?.amountPaid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "paymentType") {
      if (value === "full") {
        setForm((prev) => ({
          ...prev,
          paymentType: "full",
          amountPaid: Number(coursePrice || 0),
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          paymentType: "partial",
          amountPaid: 0,
        }));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.student || !form.course) {
      return alert("Student and Course are required");
    }

    if (!coursePrice || coursePrice <= 0) {
      return alert("Course price missing. Please set course price first.");
    }

    if (form.paymentType === "partial" && Number(form.amountPaid) <= 0) {
      return alert("Enter paid amount for partial payment");
    }

    if (Number(form.amountPaid) > Number(coursePrice)) {
      return alert("Paid amount cannot be greater than course price");
    }

    setLoading(true);
    try {
      await onSubmit({
        student: form.student,
        course: form.course,
        batch: form.batch || null,
        paymentType: form.paymentType,
        paymentMode: form.paymentMode,
        amountPaid: Number(form.amountPaid || 0),
        dueDate: form.dueDate || null,
        note: form.note,
        isActive: form.isActive,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open || !fees || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#112D4E] rounded-2xl shadow-xl border border-[#DBE2EF] dark:border-[#3F72AF] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#DBE2EF] dark:border-[#3F72AF]">
          <div>
            <h2 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
              Edit Fees
            </h2>
            <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
              Update payment and due details
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#3F72AF] hover:text-[#112D4E] dark:text-[#DBE2EF] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Student */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Student *
            </label>
            <select
              name="student"
              value={form.student}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email || "no email"})
                </option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Course *
            </label>
            <select
              name="course"
              value={form.course}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} (₹{c.price || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Batch (optional)
            </label>
            <select
              name="batch"
              value={form.batch}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            >
              <option value="">Select batch (optional)</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment type + mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Payment Type
              </label>
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
                className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
              >
                <option value="full">Full Payment</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Price + Paid + Remaining */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Course Price
              </p>
              <p className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                ₹{coursePrice}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
                Amount Paid
              </label>
              <input
                type="number"
                name="amountPaid"
                disabled={form.paymentType === "full"}
                value={form.amountPaid}
                onChange={handleChange}
                className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF] disabled:opacity-60"
              />
            </div>

            <div className="p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a]">
              <p className="text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                Remaining
              </p>
              <p className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                ₹{remainingAmount}
              </p>
              <p className="text-xs mt-1 text-[#3F72AF] dark:text-[#DBE2EF]">
                Status: <span className="font-medium capitalize">{status}</span>
              </p>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Due Date (optional)
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <span className="text-sm text-[#112D4E] dark:text-[#DBE2EF]">
              Is Active
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF]">
              Note (optional)
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full p-3 rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] bg-white dark:bg-[#0a1f3a] text-sm dark:text-[#DBE2EF]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DBE2EF] dark:border-[#3F72AF] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] text-[#3F72AF] dark:text-[#DBE2EF]"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#3F72AF] text-white hover:bg-[#112D4E] transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Update Fees"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFeesModal;
