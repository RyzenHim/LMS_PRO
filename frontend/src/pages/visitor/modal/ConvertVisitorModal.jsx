import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
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
import ModalShell from "../../../components/ui/ModalShell";

const inputCls =
  "neu-input w-full rounded-[20px] px-4 py-3 text-sm text-[var(--lms-text)] placeholder:text-[var(--lms-text-soft)]";
const labelCls =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--lms-text-soft)]";
const sectionCls = "neu-panel-soft rounded-[26px] p-5";

const Field = ({ label, hint, children, required }) => (
  <div>
    <label className={labelCls}>
      {label}
      {required ? <span className="ml-1 text-rose-500">*</span> : null}
    </label>
    {children}
    {hint ? <p className="mt-2 text-xs text-[var(--lms-text-soft)]">{hint}</p> : null}
  </div>
);

const ConvertVisitorModal = ({ open, onClose, visitor, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("full");
  const [paymentMode, setPaymentMode] = useState("offline");
  const [amountPaid, setAmountPaid] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [feeNote, setFeeNote] = useState("");
  const [batch, setBatch] = useState("");
  const [adhaar, setAdhaar] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("active");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [identityType, setIdentityType] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [identityFrontUrl, setIdentityFrontUrl] = useState("");
  const [identityBackUrl, setIdentityBackUrl] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const courseId = useMemo(() => {
    if (!visitor) return "";
    return typeof visitor.course === "object" ? visitor.course?._id : visitor.course;
  }, [visitor]);

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
    setAdhaar("");
    setAddress("");
    setDateOfBirth("");
    setGender("");
    setStatus("active");
    setGuardianName("");
    setGuardianPhone("");
    setIdentityType("");
    setIdentityNumber("");
    setIdentityFrontUrl("");
    setIdentityBackUrl("");
    setProfileImageUrl("");
    setBatches([]);
    setBatchLoading(false);
  }, [open]);

  useEffect(() => {
    if (!open || !courseId) return;
    const fetchBatches = async () => {
      try {
        setBatchLoading(true);
        const res = await batchService.getAll({ limit: 100 });
        const list = res?.data?.batches || [];
        const filtered = (Array.isArray(list) ? list : []).filter((item) => {
          const batchCourse =
            typeof item.course === "object" ? item.course?._id : item.course;
          return String(batchCourse) === String(courseId);
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
      setError("Email is required for conversion. Add an email first.");
      return;
    }
    if (!courseId) {
      setError("Visitor must have a course assigned before conversion.");
      return;
    }
    if (paymentType === "partial") {
      const paid = Number(amountPaid);
      if (!amountPaid || Number.isNaN(paid) || paid <= 0) {
        setError("Enter a valid amount paid for partial payment.");
        return;
      }
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/visitor/${visitor._id}/convert/student`, {
        paymentType,
        paymentMode,
        amountPaid: paymentType === "partial" ? Number(amountPaid) : undefined,
        dueDate: dueDate || null,
        note: feeNote || "",
        batch: batch || undefined,
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
                frontImage: identityFrontUrl ? { url: identityFrontUrl } : undefined,
                backImage: identityBackUrl ? { url: identityBackUrl } : undefined,
              }
            : undefined,
      });
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

  if (success) {
    return (
      <ModalShell
        open={open}
        onClose={() => onSuccess?.()}
        title="Conversion Successful"
        subtitle="The visitor has been converted into a student account."
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <p className="text-sm text-[var(--lms-text-soft)]">
            <span className="font-semibold text-[var(--lms-text)]">
              {visitor.name}
            </span>{" "}
            has been converted. A login account and fees record have been
            created, and the welcome email was sent to{" "}
            <span className="font-medium text-[var(--lms-text)]">
              {visitor.email}
            </span>
            .
          </p>
          <button
            onClick={() => onSuccess?.()}
            className="neu-button neu-button-primary w-full rounded-[20px] px-5 py-3 text-sm font-semibold"
          >
            Done
          </button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      open={open}
      onClose={() => !loading && onClose?.()}
      title="Convert to Student"
      subtitle={`Creates student, login, and fees records for ${visitor.name}.`}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
        {error ? (
          <div className="lms-status-error flex items-start gap-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="neu-inset rounded-[22px] px-4 py-3 text-sm text-[var(--lms-text-soft)]">
          Email: <span className="font-medium text-[var(--lms-text)]">{visitor.email || "Missing"}</span>
          {"  "}Course: <span className="font-medium text-[var(--lms-text)]">{visitor.course?.title || visitor.course || "Missing"}</span>
        </div>

        <div className={sectionCls}>
          <div className="mb-4 flex items-center gap-2">
            <User size={15} className="text-[var(--lms-accent-strong)]" />
            <h3 className="text-sm font-semibold text-[var(--lms-text)]">
              Student Details
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status" required>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </Field>
            <Field label="Gender">
              <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Aadhaar Number">
              <input value={adhaar} onChange={(e) => setAdhaar(e.target.value)} className={inputCls} placeholder="XXXX XXXX XXXX" />
            </Field>
            <Field label="Guardian Name">
              <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Guardian Phone">
              <input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </div>

        <div className={sectionCls}>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-[var(--lms-text)]">
              Identity and Profile
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Identity Type">
              <input value={identityType} onChange={(e) => setIdentityType(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Identity Number">
              <input value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Front Image URL">
              <input value={identityFrontUrl} onChange={(e) => setIdentityFrontUrl(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Back Image URL">
              <input value={identityBackUrl} onChange={(e) => setIdentityBackUrl(e.target.value)} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Profile Image URL">
                <div className="relative">
                  <ImageIcon size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lms-text-soft)]" />
                  <input value={profileImageUrl} onChange={(e) => setProfileImageUrl(e.target.value)} className={`${inputCls} pl-10`} />
                </div>
              </Field>
            </div>
          </div>
        </div>

        <div className={sectionCls}>
          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={15} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-[var(--lms-text)]">
              Fees Details
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Payment Type" required>
              <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={inputCls}>
                <option value="full">Full Payment</option>
                <option value="partial">Partial Payment</option>
              </select>
            </Field>
            <Field label="Payment Mode" required>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className={inputCls}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </Field>
            {paymentType === "partial" ? (
              <Field label="Amount Paid" required>
                <input type="number" min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className={inputCls} />
              </Field>
            ) : (
              <div className="lms-status-success self-end">
                Full course price will be recorded as paid.
              </div>
            )}
            <Field label="Due Date">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Batch"
                hint={
                  batchLoading
                    ? "Loading batches..."
                    : batches.length === 0
                      ? "No batches found for this course. You can skip this."
                      : `${batches.length} matching batches available`
                }
              >
                <select value={batch} onChange={(e) => setBatch(e.target.value)} className={inputCls} disabled={batchLoading || batches.length === 0}>
                  <option value="">No batch</option>
                  {batches.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Note">
                <textarea value={feeNote} onChange={(e) => setFeeNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </div>

        <div className="neu-inset flex items-start gap-3 rounded-[22px] px-4 py-3 text-sm text-[var(--lms-text-soft)]">
          <Info size={15} className="mt-0.5 shrink-0 text-[var(--lms-accent-strong)]" />
          <span>
            A login account will be created with a random password and sent to{" "}
            <strong className="text-[var(--lms-text)]">
              {visitor.email || "the visitor email"}
            </strong>
            .
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => !loading && onClose?.()}
            disabled={loading}
            className="neu-button rounded-[20px] px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="neu-button neu-button-primary rounded-[20px] px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <GraduationCap size={15} />
                Convert to Student
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default ConvertVisitorModal;
