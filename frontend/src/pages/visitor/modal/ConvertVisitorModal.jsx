import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import axiosInstance from "../../../api/axios";

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fees form states
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentType("full");
      setPaymentMode("offline");
      setAmountPaid("");
      setDueDate("");
      setNote("");
      setError("");
    }
  }, [open]);

  if (!open || !visitor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!visitor.email) {
      setError(
        "Email is required for conversion. Please add email to visitor first.",
      );
      return;
    }

    if (!visitor.course) {
      setError("Visitor must have a course before conversion.");
      return;
    }

    if (paymentType === "partial") {
      const paid = Number(amountPaid);
      if (!amountPaid || isNaN(paid) || paid < 0) {
        setError("Please enter a valid amountPaid for partial payment.");
        return;
      }
    }

    try {
      setLoading(true);

      // 1) convert visitor -> student
      const convertEndpoint = `/visitor/${visitor._id}/convert/student`;
      const convertRes = await axiosInstance.post(convertEndpoint);

      const student = convertRes?.data?.student; // (recommended)
      const convertedVisitor = convertRes?.data?.visitor;

      if (!student?._id) {
        // fallback if your backend returns studentId instead
        const studentId = convertRes?.data?.studentId;
        if (!studentId) {
          throw new Error("Student not returned from convert API.");
        }
      }

      const studentId = student?._id || convertRes?.data?.studentId;

      // 2) create fees record
      const feesPayload = {
        student: studentId,
        course: visitor.course, // must be ObjectId
        batch: visitor.batch || null,
        paymentType,
        paymentMode,
        amountPaid: paymentType === "partial" ? Number(amountPaid) : undefined,
        dueDate: dueDate || null,
        note: note || "",
      };

      await axiosInstance.post("/fees/addfees", feesPayload);

      alert("Visitor converted + fees added successfully!");
      onSuccess(convertedVisitor || visitor);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to convert visitor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#DBE2EF] dark:border-[#3F72AF]">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Convert Visitor
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* convert type */}
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Convert To *
            </label>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 border rounded-lg flex flex-col items-center gap-2 border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#3F72AF] text-[#112D4E] dark:text-[#DBE2EF]">
                <GraduationCap size={24} />
                <span className="text-xs">Student</span>
              </div>
            </div>
          </div>

          {/* payment type */}
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Payment Type *
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              <option value="full">Full</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {/* payment mode */}
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Payment Mode *
            </label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* amount paid */}
          {paymentType === "partial" && (
            <div>
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Amount Paid *
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter paid amount"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>
          )}

          {/* due date */}
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
            />
          </div>

          {/* note */}
          <div>
            <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any note about payment..."
              className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
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
              {loading ? "Converting..." : "Convert + Add Fees"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertVisitorModal;
