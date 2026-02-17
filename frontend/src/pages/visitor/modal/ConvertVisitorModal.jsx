import { useEffect, useState } from "react";
import {
  GraduationCap,
  X,
  CreditCard,
  User,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import axiosInstance from "../../../api/axios";

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fees fields (SUPPORTED by backend)
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [batch, setBatch] = useState("");

  // student extra fields (NOT supported by backend yet)
  const [phone, setPhone] = useState("");
  const [adhaar, setAdhaar] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("active");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Identity Proof
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityFrontUrl, setIdentityFrontUrl] = useState("");
  const [identityBackUrl, setIdentityBackUrl] = useState("");

  // Profile Image
  const [profileImageUrl, setProfileImageUrl] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setLoading(false);

    // fees defaults
    setPaymentType("full");
    setPaymentMode("offline");
    setAmountPaid("");
    setDueDate("");
    setNote("");
    setBatch("");

    // student defaults (prefill from visitor)
    setPhone(visitor?.phone || "");
    setAdhaar(visitor?.adhaar || "");
    setAddress(visitor?.address || "");
    setDateOfBirth(visitor?.dateOfBirth || "");
    setGender(visitor?.gender || "");
    setStatus("active");
    setGuardianName(visitor?.guardianName || "");
    setGuardianPhone(visitor?.guardianPhone || "");

    // identity defaults
    setIdentityType(visitor?.identityProof?.type || "");
    setIdentityNumber(visitor?.identityProof?.number || "");
    setIdentityFrontUrl(visitor?.identityProof?.frontImage?.url || "");
    setIdentityBackUrl(visitor?.identityProof?.backImage?.url || "");

    // profile defaults
    setProfileImageUrl(visitor?.profileImage?.url || "");
  }, [open, visitor]);

  // ESC close
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !visitor) return null;

  const courseId =
    typeof visitor.course === "object" ? visitor.course?._id : visitor.course;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!visitor.email) {
      setError(
        "Email is required for conversion. Please add email to visitor first.",
      );
      return;
    }

    if (!courseId) {
      setError("Visitor must have a course before conversion.");
      return;
    }

    if (paymentType === "partial") {
      const paid = Number(amountPaid);
      if (!amountPaid || isNaN(paid) || paid <= 0) {
        setError("Please enter a valid amountPaid for partial payment.");
        return;
      }
    }

    try {
      setLoading(true);

      const convertEndpoint = `/visitor/${visitor._id}/convert/student`;

      const payload = {
        paymentType,
        paymentMode,
        amountPaid: paymentType === "partial" ? Number(amountPaid) : undefined,
        dueDate: dueDate || null,
        note: note || "",
        batch: batch || undefined,

        // ⚠️ student extra fields (backend currently ignores these)
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

      const res = await axiosInstance.post(convertEndpoint, payload);

      alert(res?.data?.message || "Visitor converted successfully!");

      onSuccess(res.data?.visitor || visitor);
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

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-2">
        {label}
      </label>
      {children}
    </div>
  );

  const inputBase =
    "w-full rounded-xl border border-[#DBE2EF] dark:border-slate-700 bg-[#F9F7F7] dark:bg-[#0a1f3a] px-3 py-2.5 text-sm text-[#112D4E] dark:text-[#DBE2EF] outline-none focus:ring-2 focus:ring-[#3F72AF]/50 focus:border-[#3F72AF] transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={() => (loading ? null : onClose?.())}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#112D4E] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-[#DBE2EF] dark:border-slate-700 bg-gradient-to-r from-[#DBE2EF] to-white dark:from-[#3F72AF]/20 dark:to-[#112D4E]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#3F72AF]/15 dark:bg-[#3F72AF]/30">
              <GraduationCap
                size={20}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Convert Visitor → Student
              </h2>
              <p className="text-xs text-[#3F72AF] dark:text-slate-300 mt-0.5">
                This will create Student + User + Fees automatically
              </p>
            </div>
          </div>

          <button
            onClick={() => (loading ? null : onClose?.())}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800 text-[#112D4E] dark:text-[#DBE2EF] disabled:opacity-60 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-5 space-y-5"
        >
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Convert To */}
          <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#0a1f3a] p-4">
            <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-3">
              Convert To
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#3F72AF]/20 px-4 py-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/70 dark:bg-black/20">
                  <GraduationCap
                    size={22}
                    className="text-[#112D4E] dark:text-[#DBE2EF]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                    Student
                  </p>
                  <p className="text-xs text-[#3F72AF] dark:text-slate-300">
                    Default conversion type
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STUDENT DETAILS */}
          <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#0a1f3a] p-4">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
              <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Student Details (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status *">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputBase}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>

              <Field label="Gender (Optional)">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputBase}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Date of Birth (Optional)">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputBase}
                />
              </Field>

              <Field label="Phone (Optional)">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone"
                  className={inputBase}
                />
              </Field>

              <Field label="Aadhaar (Optional)">
                <input
                  type="text"
                  value={adhaar}
                  onChange={(e) => setAdhaar(e.target.value)}
                  placeholder="Enter Aadhaar number"
                  className={inputBase}
                />
              </Field>

              <Field label="Guardian Phone (Optional)">
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="Enter guardian phone"
                  className={inputBase}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Guardian Name (Optional)">
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Enter guardian name"
                    className={inputBase}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Address (Optional)">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="Enter address"
                    className={`${inputBase} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* IDENTITY + PROFILE */}
          <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#0a1f3a] p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck
                size={18}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Identity & Profile (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Identity Type (Optional)">
                <input
                  value={identityType}
                  onChange={(e) => setIdentityType(e.target.value)}
                  placeholder="Aadhaar / PAN / DL"
                  className={inputBase}
                />
              </Field>

              <Field label="Identity Number (Optional)">
                <input
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="Enter ID number"
                  className={inputBase}
                />
              </Field>

              <Field label="Front Image URL (Optional)">
                <input
                  value={identityFrontUrl}
                  onChange={(e) => setIdentityFrontUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputBase}
                />
              </Field>

              <Field label="Back Image URL (Optional)">
                <input
                  value={identityBackUrl}
                  onChange={(e) => setIdentityBackUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputBase}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Profile Image URL (Optional)">
                  <div className="relative">
                    <ImageIcon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3F72AF] dark:text-slate-300"
                    />
                    <input
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      placeholder="https://..."
                      className={`${inputBase} pl-10`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* FEES */}
          <div className="rounded-2xl border border-[#DBE2EF] dark:border-slate-700 bg-white dark:bg-[#0a1f3a] p-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard
                size={18}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <h3 className="text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
                Fees Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Payment Type *">
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className={inputBase}
                >
                  <option value="full">Full</option>
                  <option value="partial">Partial</option>
                </select>
              </Field>

              <Field label="Payment Mode *">
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className={inputBase}
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </Field>

              {paymentType === "partial" && (
                <Field label="Amount Paid *">
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter paid amount"
                    className={inputBase}
                  />
                </Field>
              )}

              <Field label="Due Date (Optional)">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputBase}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Note (Optional)">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Any note about payment..."
                    className={`${inputBase} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t border-[#DBE2EF] dark:border-slate-700 bg-white/95 dark:bg-[#112D4E]/95 backdrop-blur px-5 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => (loading ? null : onClose?.())}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-[#DBE2EF] dark:border-slate-700 text-sm font-semibold text-[#112D4E] dark:text-[#DBE2EF] hover:bg-[#DBE2EF] dark:hover:bg-slate-800 disabled:opacity-60 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="convert-form"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-semibold shadow-md disabled:opacity-60 transition"
          >
            {loading ? "Converting..." : "Convert Visitor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertVisitorModal;
