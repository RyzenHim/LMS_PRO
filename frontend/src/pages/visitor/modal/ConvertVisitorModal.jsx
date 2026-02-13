import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import axiosInstance from "../../../api/axios";

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fees fields
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  // Student fields (schema)
  const [phone, setPhone] = useState("");
  const [adhaar, setAdhaar] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("active");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Identity Proof (schema)
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityFrontUrl, setIdentityFrontUrl] = useState("");
  const [identityBackUrl, setIdentityBackUrl] = useState("");

  // Profile Image (schema)
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (open) {
      setPaymentType("full");
      setPaymentMode("offline");
      setAmountPaid("");
      setDueDate("");
      setNote("");
      setError("");

      // reset student fields
      setPhone(visitor?.phone || "");
      setAdhaar(visitor?.adhaar || "");
      setAddress(visitor?.address || "");
      setDateOfBirth("");
      setGender("");
      setStatus("active");
      setGuardianName("");
      setGuardianPhone("");

      // reset identity proof
      setIdentityType("");
      setIdentityNumber("");
      setIdentityFrontUrl("");
      setIdentityBackUrl("");

      // reset profile
      setProfileImageUrl("");
    }
  }, [open, visitor]);

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

      // 1) Convert visitor -> student
      const convertEndpoint = `/visitor/${visitor._id}/convert/student`;

      // NOTE:
      // This assumes your backend supports updating student fields at conversion time.
      // If not, you can call another API after conversion: PATCH /student/:id
      const convertPayload = {
        phone: phone || undefined,
        adhaar: adhaar || undefined,
        address: address || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        status: status || "active",
        guardianName: guardianName || undefined,
        guardianPhone: guardianPhone || undefined,

        profileImage: profileImageUrl ? { url: profileImageUrl } : undefined,

        identityProof:
          identityType || identityNumber || identityFrontUrl || identityBackUrl
            ? {
                type: identityType || undefined,
                number: identityNumber || undefined,
                frontImage: identityFrontUrl
                  ? { url: identityFrontUrl }
                  : undefined,
                backImage: identityBackUrl
                  ? { url: identityBackUrl }
                  : undefined,
              }
            : undefined,
      };

      const convertRes = await axiosInstance.post(
        convertEndpoint,
        convertPayload,
      );

      const student = convertRes?.data?.student;
      const convertedVisitor = convertRes?.data?.visitor;

      if (!student?._id) {
        const studentId = convertRes?.data?.studentId;
        if (!studentId)
          throw new Error("Student not returned from convert API.");
      }

      const studentId = student?._id || convertRes?.data?.studentId;

      // 2) Add fees
      const feesPayload = {
        student: studentId,
        course: visitor.course,
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
      <div className="bg-white dark:bg-[#112D4E] w-full max-w-md rounded-xl shadow-2xl p-6 border border-[#DBE2EF] dark:border-[#3F72AF] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-[#112D4E] dark:text-[#DBE2EF]">
          Convert Visitor
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 mb-3 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Convert To */}
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

          {/* ================= STUDENT DETAILS ================= */}
          <div className="pt-2 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mt-3 mb-2">
              Student Details
            </h3>

            {/* Status (enum) */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Gender (enum) */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Gender (Optional)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Phone (Optional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* Aadhaar */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Aadhaar (Optional)
              </label>
              <input
                type="text"
                value={adhaar}
                onChange={(e) => setAdhaar(e.target.value)}
                placeholder="Enter Aadhaar number"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Address (Optional)
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Enter address"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* Guardian */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Guardian Name (Optional)
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Enter guardian name"
                  className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Guardian Phone (Optional)
                </label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Enter guardian phone"
                  className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
            </div>
          </div>

          {/* ================= IDENTITY PROOF ================= */}
          <div className="pt-2 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mt-3 mb-2">
              Identity Proof (Optional)
            </h3>

            {/* Identity Type (enum) */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Proof Type
              </label>
              <select
                value={identityType}
                onChange={(e) => setIdentityType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              >
                <option value="">Select</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="pan">PAN</option>
                <option value="driving-license">Driving License</option>
                <option value="passport">Passport</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Identity Number */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Proof Number
              </label>
              <input
                type="text"
                value={identityNumber}
                onChange={(e) => setIdentityNumber(e.target.value)}
                placeholder="Enter proof number"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>

            {/* Identity Images URLs (simple inputs) */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Front Image URL
                </label>
                <input
                  type="text"
                  value={identityFrontUrl}
                  onChange={(e) => setIdentityFrontUrl(e.target.value)}
                  placeholder="Paste front image URL"
                  className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Back Image URL
                </label>
                <input
                  type="text"
                  value={identityBackUrl}
                  onChange={(e) => setIdentityBackUrl(e.target.value)}
                  placeholder="Paste back image URL"
                  className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
                />
              </div>
            </div>
          </div>

          {/* ================= PROFILE IMAGE ================= */}
          <div className="pt-2 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mt-3 mb-2">
              Profile Image (Optional)
            </h3>

            <div>
              <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                Profile Image URL
              </label>
              <input
                type="text"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="Paste profile image URL"
                className="w-full border rounded-lg px-3 py-2 bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:text-[#DBE2EF]"
              />
            </div>
          </div>

          {/* ================= FEES ================= */}
          <div className="pt-2 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
            <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mt-3 mb-2">
              Fees Details
            </h3>

            {/* Payment Type */}
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

            {/* Payment Mode */}
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

            {/* Amount Paid */}
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

            {/* Due Date */}
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

            {/* Note */}
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
          </div>

          {/* Buttons */}
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
