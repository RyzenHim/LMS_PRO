import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  X,
  CreditCard,
  User,
  ShieldCheck,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import axiosInstance from "../../../api/axios";
import { batchService } from "../../../services/batchService";

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // batches
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Fees fields
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [batch, setBatch] = useState("");

  // student optional fields
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

  const courseId = useMemo(() => {
    if (!visitor) return "";
    return typeof visitor.course === "object"
      ? visitor.course?._id
      : visitor.course;
  }, [visitor]);

  // reset on open
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

    // student defaults
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

    // reset batches
    setBatches([]);
    setBatchLoading(false);
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

  // fetch batches for course
  useEffect(() => {
    if (!open) return;
    if (!courseId) return;

    const fetchBatches = async () => {
      try {
        setBatchLoading(true);

        // ✅ correct endpoint: /batch/all
        // backend currently doesn't filter by course unless you apply backend fix
        const res = await batchService.getAll({ limit: 100 });

        const list = res?.data?.batches || [];
        const safe = Array.isArray(list) ? list : [];

        // filter in frontend (works even if backend doesn't support course filter)
        const filtered = safe.filter((b) => {
          const bCourse =
            typeof b.course === "object" ? b.course?._id : b.course;
          return String(bCourse) === String(courseId);
        });

        setBatches(filtered);
      } catch (err) {
        console.error("Fetch batches error:", err);
        setBatches([]);
      } finally {
        setBatchLoading(false);
      }
    };

    fetchBatches();
  }, [open, courseId]);

  if (!open || !visitor) return null;

  const Field = ({ label, hint, children }) => (
    <div>
      <label className="block text-sm font-semibold text-white/90 mb-2">
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-white/45 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );

  const inputBase =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#3F72AF]/50 focus:border-[#3F72AF]/60 transition";

  const cardBase =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";

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

      // ✅ parent will refresh + close
      onSuccess?.();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        onClick={() => (loading ? null : onClose?.())}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]/95 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#3F72AF]/20 border border-[#3F72AF]/20">
              <GraduationCap size={20} className="text-[#DBE2EF]" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Convert Visitor → Student
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Creates Student + User + Fees automatically
              </p>
            </div>
          </div>

          <button
            onClick={() => (loading ? null : onClose?.())}
            disabled={loading}
            className="p-2 rounded-2xl hover:bg-white/5 text-white/80 disabled:opacity-60 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form
          id="convert-form"
          onSubmit={handleSubmit}
          className="max-h-[72vh] overflow-y-auto p-5 space-y-5"
        >
          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-200 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {/* Student Details */}
          <div className={cardBase}>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-[#DBE2EF]" />
              <h3 className="text-sm font-semibold text-white/90">
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

          {/* Identity + Profile */}
          <div className={cardBase}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-[#DBE2EF]" />
              <h3 className="text-sm font-semibold text-white/90">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
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

          {/* Fees */}
          <div className={cardBase}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-[#DBE2EF]" />
              <h3 className="text-sm font-semibold text-white/90">
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
                <Field
                  label="Batch (Optional)"
                  hint="Only batches of selected course are shown."
                >
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className={inputBase}
                    disabled={batchLoading}
                  >
                    <option value="">
                      {batchLoading ? "Loading batches..." : "Select Batch"}
                    </option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

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
        <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#0b1220]/95 backdrop-blur px-5 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => (loading ? null : onClose?.())}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl border border-white/10 text-sm font-semibold text-white/80 hover:bg-white/5 disabled:opacity-60 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="convert-form"
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-semibold shadow-md disabled:opacity-60 transition inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Converting...
              </>
            ) : (
              "Convert Visitor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertVisitorModal;
