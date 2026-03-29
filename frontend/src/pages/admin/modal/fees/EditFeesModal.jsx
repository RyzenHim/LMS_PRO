import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { studentService } from "../../../../services/studentService";
import { courseService } from "../../../../services/courseService";
import { batchService } from "../../../../services/batchService";
import ModalShell from "../../../../components/ui/ModalShell";

const fieldClass =
  "neu-input mt-2 w-full rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text)]";

const EditFeesModal = ({ open, onClose, fees, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(null);
  const [coursePrice, setCoursePrice] = useState(0);

  useEffect(() => {
    if (!open) return;
    fetchStudents();
    fetchCourses();
    fetchBatches();
  }, [open]);

  useEffect(() => {
    if (!fees) return;
    setForm({
      student: fees.student?._id || "",
      course: fees.course?._id || "",
      batch: fees.batch?._id || "",
      paymentType: fees.paymentType || "full",
      paymentMode: fees.paymentMode || "offline",
      amountPaid: fees.amountPaid || 0,
      dueDate: fees.dueDate ? new Date(fees.dueDate).toISOString().slice(0, 10) : "",
      note: fees.note || "",
      isActive: fees.isActive ?? true,
    });
    setCoursePrice(Number(fees.coursePrice || fees.course?.price || 0));
  }, [fees]);

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll({ limit: 100 });
      setStudents((res.data.students || []).filter((s) => s.isDeleted === false));
    } catch (error) {
      console.error("fetchStudents error:", error);
    }
  };
  const fetchCourses = async () => {
    try {
      const res = await courseService.getAll({ limit: 100 });
      setCourses((res.data.courses || []).filter((c) => c.isDeleted === false));
    } catch (error) {
      console.error("fetchCourses error:", error);
    }
  };
  const fetchBatches = async () => {
    try {
      const res = await batchService.getAll({ limit: 100 });
      setBatches((res.data.batches || []).filter((b) => b.isDeleted === false));
    } catch (error) {
      console.error("fetchBatches error:", error);
    }
  };

  useEffect(() => {
    if (!form?.course) return;
    const course = courses.find((item) => item._id === form.course);
    const price = Number(course?.price || 0);
    setCoursePrice(price);
    if (form.paymentType === "full") {
      setForm((prev) => ({ ...prev, amountPaid: price }));
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
        setForm((prev) => ({ ...prev, paymentType: "full", amountPaid: Number(coursePrice || 0) }));
      } else {
        setForm((prev) => ({ ...prev, paymentType: "partial", amountPaid: 0 }));
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    if (!form.student || !form.course) return alert("Student and Course are required");
    if (!coursePrice || coursePrice <= 0) return alert("Course price missing. Please set course price first.");
    if (form.paymentType === "partial" && Number(form.amountPaid) <= 0) return alert("Enter paid amount for partial payment");
    if (Number(form.amountPaid) > Number(coursePrice)) return alert("Paid amount cannot be greater than course price");
    if (form.paymentType === "partial" && remainingAmount > 0 && !form.dueDate) return alert("Please enter due date for remaining amount");

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

  if (!fees || !form) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Edit Fees"
      subtitle="Update payment and due details for this record."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">Student</label>
            <select name="student" value={form.student} onChange={handleChange} className={fieldClass}>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email || "no email"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">Course</label>
            <select name="course" value={form.course} onChange={handleChange} className={fieldClass}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} (Rs {course.price || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--lms-text)]">Batch</label>
          <select name="batch" value={form.batch} onChange={handleChange} className={fieldClass}>
            <option value="">Select batch (optional)</option>
            {batches.map((batchItem) => (
              <option key={batchItem._id} value={batchItem._id}>
                {batchItem.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">Payment Type</label>
            <select name="paymentType" value={form.paymentType} onChange={handleChange} className={fieldClass}>
              <option value="full">Full Payment</option>
              <option value="partial">Partial Payment</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">Payment Mode</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className={fieldClass}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="neu-panel-soft rounded-[22px] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Course Price</p>
            <p className="mt-2 text-xl font-semibold text-[var(--lms-text)]">Rs {coursePrice}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--lms-text)]">Amount Paid</label>
            <input type="number" name="amountPaid" disabled={form.paymentType === "full"} value={form.amountPaid} onChange={handleChange} className={`${fieldClass} disabled:opacity-60`} />
          </div>
          <div className="neu-panel-soft rounded-[22px] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--lms-text-soft)]">Remaining</p>
            <p className="mt-2 text-xl font-semibold text-[var(--lms-text)]">Rs {remainingAmount}</p>
            <p className="mt-1 text-xs text-[var(--lms-text-soft)]">Status: <span className="font-semibold capitalize">{status}</span></p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--lms-text)]">Due Date</label>
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={fieldClass} />
        </div>

        <label className="neu-inset flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text)]">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Is Active
        </label>

        <div>
          <label className="text-sm font-medium text-[var(--lms-text)]">Note</label>
          <textarea name="note" value={form.note} onChange={handleChange} rows={3} className={`${fieldClass} resize-none`} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="neu-button neu-button-primary rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60">
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Update Fees"
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default EditFeesModal;
