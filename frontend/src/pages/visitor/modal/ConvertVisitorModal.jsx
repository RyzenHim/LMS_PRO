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
  CheckCircle2,
  Info,
} from "lucide-react";

import axiosInstance from "../../../api/axios";
import { batchService } from "../../../services/batchService";

// ─── Style constants outside component to prevent remounts ───────────────────
const inputCls =
  "w-full rounded-xl border border-slate-600/60 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#3F72AF]/60 focus:border-[#3F72AF]/70 transition";
const selectCls =
  "w-full rounded-xl border border-slate-600/60 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-[#3F72AF]/60 focus:border-[#3F72AF]/70 transition appearance-none";
const labelCls =
  "block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider";
const sectionCls = "rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5";

const Field = ({ label, hint, children, required }) => (
  <div>
    <label className={labelCls}>
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && (
      <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{hint}</p>
    )}
  </div>
);

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false); // ← replaces alert()

  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Fees
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [feeNote, setFeeNote] = useState("");
  const [batch, setBatch] = useState("");

  // Student optional
  const [adhaar, setAdhaar] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState(""); // enum: male | female | other
  const [status, setStatus] = useState("active"); // enum: active | inactive | suspended
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Identity Proof
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityFrontUrl, setIdentityFrontUrl] = useState("");
  const [identityBackUrl, setIdentityBackUrl] = useState("");

  // Profile image
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const courseId = useMemo(() => {
    if (!visitor) return "";
    return typeof visitor.course === "object"
      ? visitor.course?._id
      : visitor.course;
  }, [visitor]);

  // Reset all on open
  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess(false);
    setLoading(false);
    setPaymentType("full");
    setPaymentMode("offline");
    setAmountPaid("");
    setDueDate("");
    setFeeNote("");
    setBatch("");
    setAdhaar(visitor?.adhaar || "");
    setAddress(visitor?.address || "");
    setDateOfBirth(visitor?.dateOfBirth || "");
    setGender(visitor?.gender || "");
    setStatus("active");
    setGuardianName(visitor?.guardianName || "");
    setGuardianPhone(visitor?.guardianPhone || "");
    setIdentityType(visitor?.identityProof?.type || "");
    setIdentityNumber(visitor?.identityProof?.number || "");
    setIdentityFrontUrl(visitor?.identityProof?.frontImage?.url || "");
    setIdentityBackUrl(visitor?.identityProof?.backImage?.url || "");
    setProfileImageUrl(visitor?.profileImage?.url || "");
    setBatches([]);
    setBatchLoading(false);
  }, [open, visitor]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) onClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose, loading]);

  // Freeze body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fetch batches for course
  useEffect(() => {
    if (!open || !courseId) return;
    const fetchBatches = async () => {
      try {
        setBatchLoading(true);
        const res = await batchService.getAll({ limit: 100 });
        const list = res?.data?.batches || [];
        const filtered = (Array.isArray(list) ? list : []).filter((b) => {
          const bCourse =
            typeof b.course === "object" ? b.course?._id : b.course;
          return String(bCourse) === String(courseId);
        });
        setBatches(filtered);
      } catch {
        setBatches([]);
      } finally {
        setBatchLoading(false);
      }
    };
    fetchBatches();
  }, [open, courseId]);

  if (!open || !visitor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!visitor.email) {
      setError(
        "Email is required for conversion. Please add an email to this visitor first.",
      );
      return;
    }
    if (!courseId) {
      setError("Visitor must have a course assigned before conversion.");
      return;
    }
    if (paymentType === "partial") {
      const paid = Number(amountPaid);
      if (!amountPaid || isNaN(paid) || paid <= 0) {
        setError("Enter a valid amount paid for partial payment.");
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        // fees
        paymentType,
        paymentMode,
        amountPaid: paymentType === "partial" ? Number(amountPaid) : undefined,
        dueDate: dueDate || null,
        note: feeNote || "",
        batch: batch || undefined,
        // student
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

      await axiosInstance.post(
        `/visitor/${visitor._id}/convert/student`,
        payload,
      );
      setSuccess(true);
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

  // ─── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={() => {
            onSuccess?.();
          }}
        />
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0f172a] shadow-2xl shadow-black/50 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Conversion Successful!
          </h3>
          <p className="text-sm text-slate-400 mb-1">
            <span className="text-slate-200 font-medium">{visitor.name}</span>{" "}
            has been converted to a student.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            A login account and fees record have been created. A welcome email
            has been sent to{" "}
            <span className="text-slate-300">{visitor.email}</span>.
          </p>
          <button
            onClick={() => {
              onSuccess?.();
            }}
            className="w-full px-5 py-3 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold shadow-lg shadow-[#3F72AF]/20 transition active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !loading && onClose?.()}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-700/60 bg-[#0f172a] shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/60 bg-gradient-to-r from-[#3F72AF]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#3F72AF]/20 border border-[#3F72AF]/30">
              <GraduationCap size={20} className="text-[#7aa8d8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Convert to Student
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Creates Student · Auth Login · Fees record for{" "}
                <span className="text-slate-200 font-medium">
                  {visitor.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white disabled:opacity-50 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Visitor info strip */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-700/40 flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
          <span>
            <span className="text-slate-500">Email: </span>
            <span
              className={
                visitor.email
                  ? "text-slate-200 font-medium"
                  : "text-red-400 font-medium"
              }
            >
              {visitor.email || "⚠ Missing — required for conversion"}
            </span>
          </span>
          <span>
            <span className="text-slate-500">Course: </span>
            <span
              className={
                visitor.course ? "text-slate-200 font-medium" : "text-red-400"
              }
            >
              {visitor.course?.title || visitor.course || "⚠ Missing"}
            </span>
          </span>
          {visitor.phone && (
            <span>
              <span className="text-slate-500">Phone: </span>
              <span className="text-slate-200 font-medium">
                {visitor.phone}
              </span>
            </span>
          )}
        </div>

        {/* Scrollable body */}
        <form
          id="convert-form"
          onSubmit={handleSubmit}
          className="max-h-[62vh] overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
        >
          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3">
              <AlertTriangle
                size={15}
                className="text-red-400 mt-0.5 shrink-0"
              />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ── SECTION 1: Student Details ── */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[#3F72AF]/15">
                <User size={14} className="text-[#7aa8d8]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">
                Student Details
              </h3>
              <span className="text-xs text-slate-500 ml-1">— optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status" required>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
              <Field label="Gender">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Date of Birth">
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Aadhaar Number">
                <input
                  type="text"
                  value={adhaar}
                  onChange={(e) => setAdhaar(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className={inputCls}
                />
              </Field>
              <Field label="Guardian Name">
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Guardian full name"
                  className={inputCls}
                />
              </Field>
              <Field label="Guardian Phone">
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="10-digit number"
                  className={inputCls}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="Full address"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Identity & Profile ── */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-emerald-500/15">
                <ShieldCheck size={14} className="text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">
                Identity & Profile
              </h3>
              <span className="text-xs text-slate-500 ml-1">— optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Identity Type">
                <input
                  value={identityType}
                  onChange={(e) => setIdentityType(e.target.value)}
                  placeholder="e.g. Aadhaar, PAN, Passport"
                  className={inputCls}
                />
              </Field>
              <Field label="Identity Number">
                <input
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="ID number"
                  className={inputCls}
                />
              </Field>
              <Field label="Front Image URL">
                <input
                  value={identityFrontUrl}
                  onChange={(e) => setIdentityFrontUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <Field label="Back Image URL">
                <input
                  value={identityBackUrl}
                  onChange={(e) => setIdentityBackUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Profile Image URL">
                  <div className="relative">
                    <ImageIcon
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      placeholder="https://..."
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Fees ── */}
          <div className={sectionCls}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-amber-500/15">
                <CreditCard size={14} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">
                Fees Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Payment Type" required>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className={selectCls}
                >
                  <option value="full">Full Payment</option>
                  <option value="partial">Partial Payment</option>
                </select>
              </Field>
              <Field label="Payment Mode" required>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className={selectCls}
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </Field>

              {paymentType === "partial" ? (
                <Field label="Amount Paid (₹)" required>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 self-end mb-0.5">
                  <CheckCircle2 size={13} className="shrink-0" />
                  Full course price will be recorded as paid
                </div>
              )}

              <Field label="Due Date">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputCls}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Batch"
                  hint={
                    batchLoading
                      ? "Loading batches…"
                      : batches.length === 0
                        ? "No batches found for this course — you can skip"
                        : `${batches.length} batch${batches.length > 1 ? "es" : ""} available`
                  }
                >
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className={selectCls}
                    disabled={batchLoading || batches.length === 0}
                  >
                    <option value="">
                      {batchLoading ? "Loading…" : "No batch (skip)"}
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
                <Field label="Note">
                  <textarea
                    value={feeNote}
                    onChange={(e) => setFeeNote(e.target.value)}
                    rows={2}
                    placeholder="Optional note about payment…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#3F72AF]/10 border border-[#3F72AF]/20 text-xs text-[#7aa8d8]">
            <Info size={13} className="shrink-0 mt-0.5" />
            <span>
              A login account will be created with a randomly generated password
              and sent to{" "}
              <strong className="text-slate-200">
                {visitor.email || "the visitor's email"}
              </strong>
              .
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/60 bg-slate-900/50">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-slate-600/60 text-sm font-semibold text-slate-300 hover:bg-slate-700/50 hover:text-white disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="convert-form"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white text-sm font-bold shadow-lg shadow-[#3F72AF]/20 disabled:opacity-60 transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <GraduationCap size={15} />
                Convert to Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertVisitorModal;
